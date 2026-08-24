import { ExtensionType } from '../../../extensions/Extensions';
import { warn } from '../../../utils/logging/warn';
import { type ShaderOverrides } from '../shared/shader/ShaderOverrides';
import { RenderBundle } from './RenderBundle';

import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { Buffer } from '../shared/buffer/Buffer';
import type { Topology } from '../shared/geometry/const';
import type { Geometry } from '../shared/geometry/Geometry';
import type { Shader } from '../shared/shader/Shader';
import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { State } from '../shared/state/State';
import type { System } from '../shared/system/System';
import type { GPU } from './GpuDeviceSystem';
import type { GpuRenderTarget } from './renderTarget/GpuRenderTarget';
import type { BindGroup } from './shader/BindGroup';
import type { GpuProgram } from './shader/GpuProgram';
import type { WebGPURenderer } from './WebGPURenderer';

interface BoundBindGroupSlot
{
    bindGroup: BindGroup;
    program: GpuProgram;
    key: string;
}

/**
 * The system that handles encoding commands for the GPU.
 * @category rendering
 * @advanced
 */
export class GpuEncoderSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'encoder',
        priority: 1
    } as const;

    public commandEncoder: GPUCommandEncoder;
    /**
     * The active command target that draws and state are recorded into. This is the live render
     * pass during normal rendering, or a {@link GPURenderBundleEncoder} while a render bundle is
     * being recorded (see {@link beginBundle}). Both encoders expose the same render/bind command
     * API the encoder relies on ({@link GPURenderCommandsMixin} + {@link GPUBindingCommandsMixin}),
     * so callers write to it without caring which one is active. Pass-level commands (viewport,
     * stencil, executeBundles, end) are not part of that shared API and go through {@link _passEncoder}.
     */
    public renderPassEncoder: GPURenderPassEncoder | GPURenderBundleEncoder;
    public commandFinished: Promise<void>;

    private _resolveCommandFinished: (value: void) => void;

    private _gpu: GPU;
    /**
     * Per-slot cache of the last (bindGroup, program, resource-key) bound to that
     * group index. All three prongs must match for the encoder to skip rebinding —
     * see {@link setBindGroup}. Slots are allocated once in the constructor and
     * mutated in place to avoid per-call allocation on the hot path.
     */
    private _boundBindGroup: Record<number, BoundBindGroupSlot> = Object.create(null);
    private _boundVertexBuffer: Record<number, Buffer> = Object.create(null);
    private _boundIndexBuffer: Buffer;
    private _boundPipeline: GPURenderPipeline;
    /**
     * The real render pass encoder. Unlike {@link renderPassEncoder}, this is never swapped out for
     * a bundle encoder, so pass-level commands (viewport, stencil, executeBundles, end) always have
     * a correctly typed target — even while a bundle is being recorded.
     */
    private _passEncoder: GPURenderPassEncoder;
    /**
     * {@link PipelineSystem.bundleStateKey} as it was when {@link beginBundle} built the bundle
     * encoder's descriptor, ready to stamp onto the {@link RenderBundle} that {@link endBundle}
     * returns. Sampled at that moment so the stamp and the state the bundle actually baked cannot
     * describe different render targets.
     */
    private _bundleStateKey: number;
    /** The label passed to {@link beginBundle}, carried through to the finished bundle. */
    private _bundleLabel: string;

    private readonly _renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;

        for (let i = 0; i < 16; i++)
        {
            this._boundBindGroup[i] = { bindGroup: null, program: null, key: null };
        }
    }

    public renderStart(): void
    {
        this.commandFinished = new Promise((resolve) =>
        {
            this._resolveCommandFinished = resolve;
        });

        // generate a render pass description..
        // create an encoder..
        this.commandEncoder = this._renderer.gpu.device.createCommandEncoder();
    }

    public beginRenderPass(gpuRenderTarget: GpuRenderTarget)
    {
        this.endRenderPass();

        this._clearCache();

        this._passEncoder = this.commandEncoder.beginRenderPass(gpuRenderTarget.descriptor);
        this.renderPassEncoder = this._passEncoder;
    }

    public endRenderPass()
    {
        if (this._passEncoder)
        {
            this._passEncoder.end();
        }

        this.renderPassEncoder = null;
        this._passEncoder = null;
    }

    /**
     * Begins recording a render bundle. While recording, all draw commands are captured into a
     * {@link GPURenderBundleEncoder} instead of the active render pass. The current render pass
     * encoder is saved and restored when {@link endBundle} is called.
     *
     * Render bundles allow pre-recording of draw commands that can be replayed multiple times
     * via {@link executeBundle}, reducing CPU overhead for repeated draw sequences.
     * @param label - Optional debug label. Names the bundle in GPU captures and in the WebGPU
     * validation errors it can raise when replayed, instead of `(unlabeled)`.
     * @throws If a render bundle is already being recorded.
     */
    public beginBundle(label?: string): void
    {
        // While a bundle is recording, renderPassEncoder is swapped to the bundle encoder and no
        // longer matches the real pass. Equal references therefore mean no bundle is active.
        if (this._passEncoder !== this.renderPassEncoder)
        {
            throw new Error('Cannot begin a new render bundle while one is already being recorded.');
        }

        this._clearCache();

        const pipeline = this._renderer.pipeline;
        const descriptor = pipeline.getBundleDescriptor();

        descriptor.label = label;

        this._bundleStateKey = pipeline.bundleStateKey;
        this._bundleLabel = label;

        // A bundle encoder exposes the same render/bind command API as the pass, so it stands in as
        // the write target while recording. The real pass stays in _passEncoder and is restored by
        // endBundle.
        this.renderPassEncoder = this._gpu.device.createRenderBundleEncoder(descriptor);
    }

    /**
     * Finishes recording the current render bundle and restores the previous render pass encoder.
     * @returns The recorded {@link RenderBundle}, ready to be executed via {@link executeBundle} and
     * stamped with the pipeline state it baked so {@link isBundleValid} can vet it on later frames.
     */
    public endBundle(): RenderBundle
    {
        const encoder = this.renderPassEncoder;

        // `finish` only exists on a bundle encoder, so it both narrows the type for the call below
        // and guards against endBundle being called without an active bundle.
        if (!encoder || !('finish' in encoder))
        {
            throw new Error('endBundle called without an active render bundle.');
        }

        // the label goes on the bundle as well as on its encoder: WebGPU names the bundle, not the
        // encoder, in the validation error executeBundles raises
        const gpuBundle = encoder.finish({ label: this._bundleLabel });

        this.renderPassEncoder = this._passEncoder;
        this._clearCache();

        return new RenderBundle(gpuBundle, this._bundleStateKey, this._bundleLabel);
    }

    /**
     * Checks whether a recorded bundle can still be replayed against the render target that is
     * bound now.
     *
     * A bundle permanently bakes the attachment state it was recorded with — color format(s),
     * color target count, depth/stencil format, sample count — and WebGPU rejects the entire
     * command buffer if any of it differs at execute time. It also bakes the front-face winding of
     * its pipelines, which WebGPU does *not* validate: once the target's {@link RenderTarget.flipY}
     * parity changes, replaying silently renders geometry inside out.
     *
     * Ask before replaying rather than after: only the caller owns the draw commands, so only the
     * caller can re-record. A missing bundle reports `false`, so `!isBundleValid(bundles[i])` reads
     * correctly on the first frame, before anything has been recorded.
     * @param bundle - The bundle to check, as returned by {@link endBundle}.
     * @returns `true` if the bundle is safe to execute right now, `false` if it must be re-recorded.
     */
    public isBundleValid(bundle: RenderBundle): boolean
    {
        return bundle?.stateKey === this._renderer.pipeline.bundleStateKey;
    }

    /**
     * Replays previously recorded render bundles on the current render pass.
     * The bound state cache is cleared since a bundle may set its own pipeline, bind groups, and buffers.
     *
     * Pass a whole run of bundles rather than calling this once per bundle: WebGPU resets the pass
     * state after every call, so N calls cost N cache clears and N trips through the binding layer
     * for exactly the same result.
     *
     * Every bundle must have been recorded against a matching render target — check with
     * {@link isBundleValid} first and re-record if it says no, as Pixi cannot rebuild your draw
     * commands for you.
     * @param bundle - The render bundle to execute, or a run of them to execute in one call.
     */
    public executeBundle(bundle: RenderBundle | RenderBundle[]): void
    {
        const gpuBundles: GPURenderBundle[] = [];

        if (Array.isArray(bundle))
        {
            for (let i = 0; i < bundle.length; i++)
            {
                gpuBundles[i] = this._getGpuBundle(bundle[i]);
            }
        }
        else
        {
            gpuBundles[0] = this._getGpuBundle(bundle);
        }

        this._clearCache();
        this._passEncoder.executeBundles(gpuBundles);
    }

    /**
     * Unwraps a bundle for {@link executeBundle}, complaining first if it no longer matches the
     * bound render target — the winding half of that mismatch is invisible otherwise, since WebGPU
     * validates attachments but not front-face order.
     * @param bundle - The bundle being executed.
     * @returns The native bundle to hand to `executeBundles`.
     */
    private _getGpuBundle(bundle: RenderBundle): GPURenderBundle
    {
        // #if _DEBUG
        if (!this.isBundleValid(bundle))
        {
            warn(`Render bundle ${bundle?.label ?? '(unlabeled)'} was recorded against a different render `
                + 'target state. Re-record it — replaying it will either be rejected by WebGPU or draw '
                + 'with the wrong winding. Check encoder.isBundleValid(bundle) before executing.');
        }
        // #endif

        return bundle.gpuBundle;
    }

    public setViewport(viewport: Rectangle): void
    {
        this._passEncoder.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0, 1);
    }

    /**
     * Sets the stencil reference value for subsequent draws. This is a pass-level command, so it
     * always targets the real render pass — not a bundle encoder, which cannot set stencil state.
     * @param stencilReference - The stencil reference value to use.
     */
    public setStencilReference(stencilReference: number): void
    {
        this._passEncoder.setStencilReference(stencilReference);
    }

    public setPipelineFromGeometryProgramAndState(
        geometry: Geometry,
        program: GpuProgram,
        state: any,
        topology?: Topology,
        overrides?: ShaderOverrides,
    ): void
    {
        const pipeline = this._renderer.pipeline.getPipeline(
            geometry,
            program,
            state,
            topology,
            overrides,
        );

        this.setPipeline(pipeline);
    }

    public setPipeline(pipeline: GPURenderPipeline)
    {
        if (this._boundPipeline === pipeline) return;
        this._boundPipeline = pipeline;

        this.renderPassEncoder.setPipeline(pipeline);
    }

    private _setVertexBuffer(index: number, buffer: Buffer)
    {
        if (this._boundVertexBuffer[index] === buffer) return;

        this._boundVertexBuffer[index] = buffer;

        this.renderPassEncoder.setVertexBuffer(index, this._renderer.buffer.updateBuffer(buffer));
    }

    private _setIndexBuffer(buffer: Buffer)
    {
        if (this._boundIndexBuffer === buffer) return;

        this._boundIndexBuffer = buffer;

        const indexFormat = buffer.data.BYTES_PER_ELEMENT === 2 ? 'uint16' : 'uint32';

        this.renderPassEncoder.setIndexBuffer(this._renderer.buffer.updateBuffer(buffer), indexFormat);
    }

    public resetBindGroup(index: number)
    {
        const slot = this._boundBindGroup[index];

        slot.bindGroup = null;
        slot.program = null;
        slot.key = null;
    }

    public setBindGroup(index: number, bindGroup: BindGroup, program: GpuProgram)
    {
        // The cached GPUBindGroup is only valid when the JS BindGroup, the program
        // (its layout key), and the BindGroup's resource set (its _key) are all unchanged.
        // BindGroupSystem interns one GPUBindGroup per (bindGroup, program, groupIndex),
        // so if any prong differs we must re-resolve and rebind.
        const slot = this._boundBindGroup[index];

        if (slot.bindGroup === bindGroup
            && slot.program === program
            && slot.key === bindGroup._key) return;

        slot.bindGroup = bindGroup;
        slot.program = program;
        slot.key = bindGroup._key;

        bindGroup._touch(this._renderer.gc.now, this._renderer.tick);

        const gpuBindGroup = this._renderer.bindGroup.getBindGroup(bindGroup, program, index);

        this.renderPassEncoder.setBindGroup(index, gpuBindGroup);
    }

    public setGeometry(geometry: Geometry, program: GpuProgram)
    {
        // when binding a buffers for geometry, there is no need to bind a buffer more than once if it is interleaved.
        // which is often the case for Pixi. This is a performance optimisation.
        // Instead of looping through the attributes, we instead call getBufferNamesToBind
        // which returns a list of buffer names that need to be bound.
        // we can then loop through this list and bind the buffers.
        // essentially only binding a single time for any buffers that are interleaved.
        const buffersToBind = this._renderer.pipeline.getBufferNamesToBind(geometry, program);

        for (const i in buffersToBind)
        {
            this._setVertexBuffer(parseInt(i, 10), geometry.attributes[buffersToBind[i]].buffer);
        }

        if (geometry.indexBuffer)
        {
            this._setIndexBuffer(geometry.indexBuffer);
        }
    }

    private _setShaderBindGroups(shader: Shader, skipSync?: boolean)
    {
        const program = shader.gpuProgram;

        for (const i in shader.groups)
        {
            // resources that only exist for the other backend (e.g. GL-fallback uniforms,
            // parked in group 99 by Shader.from) have no entry in this program's layout —
            // there is nothing to sync or bind for them
            if (!program.layout[i as unknown as number]) continue;

            const bindGroup = shader.groups[i] as BindGroup;

            // update any uniforms?
            if (!skipSync)
            {
                this._syncBindGroup(bindGroup);
            }

            this.setBindGroup(i as unknown as number, bindGroup, program);
        }
    }

    private _syncBindGroup(bindGroup: BindGroup)
    {
        for (const j in bindGroup.resources)
        {
            const resource = bindGroup.resources[j];

            // a destroyed buffer-like resource leaves a null slot (see BindGroup.onResourceChange)
            if (!resource) continue;

            if ((resource as UniformGroup).isUniformGroup)
            {
                this._renderer.ubo.updateUniformGroup(resource as UniformGroup);
            }
        }
    }

    public draw(options: {
        geometry: Geometry;
        shader: Shader;
        state?: State;
        topology?: Topology;
        size?: number;
        start?: number;
        baseVertex?: number;
        instanceCount?: number;
        skipSync?: boolean;
        firstInstance?: number;
    })
    {
        const { geometry, shader, state, topology, size, start, baseVertex, instanceCount, skipSync, firstInstance }
            = options;

        this.setPipelineFromGeometryProgramAndState(geometry, shader.gpuProgram, state, topology, shader._overrides);
        this.setGeometry(geometry, shader.gpuProgram);
        this._setShaderBindGroups(shader, skipSync);

        if (geometry.indexBuffer)
        {
            this.renderPassEncoder.drawIndexed(
                size || geometry.indexBuffer.data.length,
                instanceCount ?? geometry.instanceCount,
                start || 0,
                baseVertex || 0,
                firstInstance || 0
            );
        }
        else
        {
            this.renderPassEncoder.draw(
                size || geometry.vertexCount,
                instanceCount ?? geometry.instanceCount,
                start || 0,
                firstInstance || 0
            );
        }
    }

    /**
     * Sets up the pipeline, geometry, and bind groups then issues an indirect draw call.
     * Uses `drawIndexedIndirect` when the geometry has an index buffer, otherwise `drawIndirect`.
     * Draw parameters (vertex count, instance count, etc.) are read from the indirect buffer on the GPU.
     * @param options - The draw options.
     * @param options.geometry - The geometry to draw.
     * @param options.shader - The shader to use.
     * @param options.state - Optional render state (blending, depth, etc.).
     * @param options.topology - Optional primitive topology override.
     * @param options.skipSync - If true, skips syncing uniform groups to their GPU buffers.
     * @param options.indirectBuffer - The GPU buffer containing the indirect draw parameters.
     * @param options.indirectOffset - Byte offset into the indirect buffer.
     */
    public drawIndirect(options: {
        geometry: Geometry;
        shader: Shader;
        state?: State;
        topology?: Topology;
        skipSync?: boolean;
        indirectBuffer: GPUBuffer;
        indirectOffset: number;
    })
    {
        const { geometry, shader, state, topology, skipSync, indirectBuffer, indirectOffset } = options;

        this.setPipelineFromGeometryProgramAndState(geometry, shader.gpuProgram, state, topology, shader._overrides);
        this.setGeometry(geometry, shader.gpuProgram);
        this._setShaderBindGroups(shader, skipSync);

        if (geometry.indexBuffer)
        {
            this.renderPassEncoder.drawIndexedIndirect(indirectBuffer, indirectOffset);
        }
        else
        {
            this.renderPassEncoder.drawIndirect(indirectBuffer, indirectOffset);
        }
    }

    public finishRenderPass()
    {
        if (this._passEncoder)
        {
            this._passEncoder.end();
            this.renderPassEncoder = null;
            this._passEncoder = null;
        }
    }

    public postrender()
    {
        this.finishRenderPass();

        this._gpu.device.queue.submit([this.commandEncoder.finish()]);

        this._resolveCommandFinished();

        this.commandEncoder = null;
    }

    private _clearCache()
    {
        for (let i = 0; i < 16; i++)
        {
            const slot = this._boundBindGroup[i];

            slot.bindGroup = null;
            slot.program = null;
            slot.key = null;
            this._boundVertexBuffer[i] = null;
        }

        this._boundIndexBuffer = null;
        this._boundPipeline = null;
    }

    public destroy()
    {
        (this._renderer as null) = null;
        this._gpu = null;
        this._boundBindGroup = null;
        this._boundVertexBuffer = null;
        this._boundIndexBuffer = null;
        this._boundPipeline = null;
        this.renderPassEncoder = null;
        this._passEncoder = null;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }
}
