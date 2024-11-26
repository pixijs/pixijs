import { ExtensionType } from '../../../extensions/Extensions';

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
import type { GpuRenderTargetAdaptor } from './renderTarget/GpuRenderTargetAdaptor';
import type { BindGroup } from './shader/BindGroup';
import type { GpuProgram } from './shader/GpuProgram';
import type { WebGPURenderer } from './WebGPURenderer';

/**
 * The system that handles encoding commands for the GPU.
 * @memberof rendering
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
    private _boundVertexBuffer: Record<number, Buffer> = Object.create(null);
    private _boundIndexBuffer: Buffer;
    private _boundPipeline: GPURenderPipeline;

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

    public setViewport(viewport: Rectangle): void
    {
        this.renderPassEncoder.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0, 1);
    }

    public setPipelineFromGeometryProgramAndState(
        geometry: Geometry,
        program: GpuProgram,
        state: any,
        topology?: Topology,
    ): void
    {
        const pipeline = this._renderer.pipeline.getPipeline(geometry, program, state, topology);

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
    }

    public setBindGroup(index: number, bindGroup: BindGroup, program: GpuProgram)
    {
        if (this._boundBindGroup[index] === bindGroup) return;
        this._boundBindGroup[index] = bindGroup;

        bindGroup._touch(this._renderer.textureGC.count);

        // TODO getting the bind group works as it looks at th e assets and generates a key
        // should this just be hidden behind a dirty flag?
        const gpuBindGroup = this._renderer.bindGroup.getBindGroup(bindGroup, program, index);

        // mark each item as having been used..
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
            this._setVertexBuffer(i as any as number, geometry.attributes[buffersToBind[i]].buffer);
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
        instanceCount?: number;
        skipSync?: boolean;
    })
    {
        const { geometry, shader, state, topology, size, start, instanceCount, skipSync } = options;

        this.setPipelineFromGeometryProgramAndState(geometry, shader.gpuProgram, state, topology);
        this.setGeometry(geometry, shader.gpuProgram);
        this._setShaderBindGroups(shader, skipSync);

        if (geometry.indexBuffer)
        {
            this.renderPassEncoder.drawIndexed(
                size || geometry.indexBuffer.data.length,
                instanceCount ?? geometry.instanceCount,
                start || 0
            );
        }
        else
        {
            this.renderPassEncoder.draw(size || geometry.getSize(), instanceCount ?? geometry.instanceCount, start || 0);
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

    // restores a render pass if finishRenderPass was called
    // not optimised as really used for debugging!
    // used when we want to stop drawing and log a texture..
    public restoreRenderPass()
    {
        const descriptor = (this._renderer.renderTarget.adaptor as GpuRenderTargetAdaptor).getDescriptor(
            this._renderer.renderTarget.renderTarget,
            false,
            [0, 0, 0, 1],
        );

        this.renderPassEncoder = this.commandEncoder.beginRenderPass(descriptor);

        const boundPipeline = this._boundPipeline;
        const boundVertexBuffer = { ...this._boundVertexBuffer };
        const boundIndexBuffer = this._boundIndexBuffer;
        const boundBindGroup = { ...this._boundBindGroup };

        this._clearCache();

        const viewport = this._renderer.renderTarget.viewport;

        this.renderPassEncoder.setViewport(viewport.x, viewport.y, viewport.width, viewport.height, 0, 1);

        // reinstate the cache...

        this.setPipeline(boundPipeline);

        for (const i in boundVertexBuffer)
        {
            this._setVertexBuffer(i as unknown as number, boundVertexBuffer[i]);
        }

        for (const i in boundBindGroup)
        {
            this.setBindGroup(i as unknown as number, boundBindGroup[i], null);
        }

        this._setIndexBuffer(boundIndexBuffer);
    }

    private _clearCache()
    {
        for (let i = 0; i < 16; i++)
        {
            this._boundBindGroup[i] = null;
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
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
    }
}
