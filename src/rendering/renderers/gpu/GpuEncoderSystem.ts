import { ExtensionType } from '../../../extensions/Extensions';
import { type ShaderOverrides } from '../shared/shader/ShaderOverrides';

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
    public renderPassEncoder: GPURenderPassEncoder;
    public commandFinished: Promise<void>;

    private _resolveCommandFinished: (value: void) => void;

    private _gpu: GPU;
    private _boundBindGroup: Record<number, BindGroup> = Object.create(null);
    private _boundBindGroupKey: Record<number, string> = Object.create(null);
    private _boundVertexBuffer: Record<number, Buffer> = Object.create(null);
    private _boundIndexBuffer: Buffer;
    private _boundPipeline: GPURenderPipeline;
    /** Stores the real render pass encoder while a render bundle is being recorded. */
    private _savedPassEncoder: GPURenderPassEncoder | null = null;

    private readonly _renderer: WebGPURenderer;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
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

        this.renderPassEncoder = this.commandEncoder.beginRenderPass(gpuRenderTarget.descriptor);
    }

    public endRenderPass()
    {
        if (this.renderPassEncoder)
        {
            this.renderPassEncoder.end();
        }

        this.renderPassEncoder = null;
    }

    /**
     * Begins recording a render bundle. While recording, all draw commands are captured into a
     * {@link GPURenderBundleEncoder} instead of the active render pass. The current render pass
     * encoder is saved and restored when {@link endBundle} is called.
     *
     * Render bundles allow pre-recording of draw commands that can be replayed multiple times
     * via {@link executeBundle}, reducing CPU overhead for repeated draw sequences.
     * @throws If a render bundle is already being recorded.
     */
    public beginBundle(): void
    {
        if (this._savedPassEncoder)
        {
            throw new Error('Cannot begin a new render bundle while one is already being recorded.');
        }

        this._savedPassEncoder = this.renderPassEncoder;
        this._clearCache();

        const descriptor = this._renderer.pipeline.getBundleDescriptor();

        this.renderPassEncoder = this._gpu.device
            .createRenderBundleEncoder(descriptor) as unknown as GPURenderPassEncoder;
    }

    /**
     * Finishes recording the current render bundle and restores the previous render pass encoder.
     * @returns The recorded {@link GPURenderBundle} ready to be executed via {@link executeBundle}.
     */
    public endBundle(): GPURenderBundle
    {
        const bundle = (this.renderPassEncoder as unknown as GPURenderBundleEncoder).finish();

        this.renderPassEncoder = this._savedPassEncoder;
        this._savedPassEncoder = null;
        this._clearCache();

        return bundle;
    }

    /**
     * Replays a previously recorded render bundle on the current render pass.
     * The bound state cache is cleared since the bundle may set its own pipeline, bind groups, and buffers.
     * @param bundle - The render bundle to execute.
     */
    public executeBundle(bundle: GPURenderBundle): void
    {
        this._clearCache();
        (this.renderPassEncoder as GPURenderPassEncoder).executeBundles([bundle]);
    }

    public setViewport(viewport: Rectangle): void
    {
        this.renderPassEncoder.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0, 1);
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
        this._boundBindGroup[index] = null;
        this._boundBindGroupKey[index] = null;
    }

    public setBindGroup(index: number, bindGroup: BindGroup, program: GpuProgram)
    {
        if (this._boundBindGroupKey[index] === bindGroup._key) return;

        this._boundBindGroup[index] = bindGroup;
        this._boundBindGroupKey[index] = bindGroup._key;

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
        for (const i in shader.groups)
        {
            const bindGroup = shader.groups[i] as BindGroup;

            // update any uniforms?
            if (!skipSync)
            {
                this._syncBindGroup(bindGroup);
            }

            this.setBindGroup(i as unknown as number, bindGroup, shader.gpuProgram);
        }
    }

    private _syncBindGroup(bindGroup: BindGroup)
    {
        for (const j in bindGroup.resources)
        {
            const resource = bindGroup.resources[j];

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
        if (this.renderPassEncoder)
        {
            this.renderPassEncoder.end();
            this.renderPassEncoder = null;
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
            this._boundBindGroup[i] = null;
            this._boundBindGroupKey[i] = null;
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
        this._boundBindGroupKey = null;
        this._boundVertexBuffer = null;
        this._boundIndexBuffer = null;
        this._boundPipeline = null;
        this._savedPassEncoder = null;
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }
}
