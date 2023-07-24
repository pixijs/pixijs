import { ExtensionType } from '../../../extensions/Extensions';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferResource } from '../shared/buffer/BufferResource';
import { BufferUsage } from '../shared/buffer/const';
import { UniformBufferBatch } from './buffer/UniformBufferBatch';
import { BindGroup } from './shader/BindGroup';

import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { WebGPURenderer } from './WebGPURenderer';

const minUniformOffsetAlignment = 128;// 256 / 2;

// TODO renderStart and renderFinish - perhaps just make them instructions to fit the architecture of the
// rest of the system
export class GpuUniformBatchPipe
{
    /** @ignore */
    static extension = {
        type: [
            ExtensionType.WebGPUPipes,
        ],
        name: 'uniformBatch',
    } as const;

    private renderer: WebGPURenderer;

    private bindGroupHash: Record<number, BindGroup> = {};
    private readonly batchBuffer: UniformBufferBatch;

    // number of buffers..
    private buffers: Buffer[] = [];

    private bindGroups: BindGroup[] = [];
    private bufferResources: BufferResource[] = [];

    constructor(renderer: WebGPURenderer)
    {
        this.renderer = renderer;

        this.batchBuffer = new UniformBufferBatch({ minUniformOffsetAlignment });

        const totalBuffers = (256 / minUniformOffsetAlignment);

        for (let i = 0; i < totalBuffers; i++)
        {
            let usage = BufferUsage.UNIFORM | BufferUsage.COPY_DST;

            if (i === 0) usage |= BufferUsage.COPY_SRC;

            this.buffers.push(new Buffer({
                data: this.batchBuffer.data,
                usage
            }));
        }
    }

    renderEnd()
    {
        this.uploadBindGroups();
        this.resetBindGroups();
    }

    private resetBindGroups()
    {
        for (const i in this.bindGroupHash)
        {
            this.bindGroupHash[i] = null;
        }

        this.batchBuffer.clear();
    }

    // just works for single bind groups for now
    getUniformBindGroup(group: UniformGroup<any>, duplicate: boolean): BindGroup
    {
        if (!duplicate && this.bindGroupHash[group.uid])
        {
            return this.bindGroupHash[group.uid];
        }

        this.renderer.uniformBuffer.ensureUniformGroup(group);

        const data = group.buffer.data as Float32Array;

        const offset = this.batchBuffer.addEmptyGroup(data.length);

        this.renderer.uniformBuffer.syncUniformGroup(group, this.batchBuffer.data, offset / 4);

        this.bindGroupHash[group.uid] = this.getBindGroup(offset / minUniformOffsetAlignment);

        return this.bindGroupHash[group.uid];
    }

    getUniformBufferResource(group: UniformGroup<any>): BufferResource
    {
        this.renderer.uniformBuffer.updateUniformGroup(group);

        const data = group.buffer.data as Float32Array;

        const offset = this.batchBuffer.addGroup(data);

        return this.getBufferResource(offset / minUniformOffsetAlignment);
    }

    getArrayBindGroup(data: Float32Array): BindGroup
    {
        const offset = this.batchBuffer.addGroup(data);

        return this.getBindGroup(offset / minUniformOffsetAlignment);
    }

    getArrayBufferResource(data: Float32Array): BufferResource
    {
        const offset = this.batchBuffer.addGroup(data);

        const index = offset / minUniformOffsetAlignment;

        return this.getBufferResource(index);
    }

    getBufferResource(index: number): BufferResource
    {
        if (!this.bufferResources[index])
        {
            const buffer = this.buffers[index % 2];

            this.bufferResources[index] = new BufferResource({
                buffer,
                offset: ((index / 2) | 0) * 256,
                size: minUniformOffsetAlignment
            });
        }

        return this.bufferResources[index];
    }

    getBindGroup(index: number): BindGroup
    {
        if (!this.bindGroups[index])
        {
            // even!
            const bindGroup = new BindGroup({
                0: this.getBufferResource(index),
            });

            this.bindGroups[index] = bindGroup;
        }

        return this.bindGroups[index];
    }

    uploadBindGroups()
    {
        const bufferSystem = this.renderer.buffer;

        const firstBuffer = this.buffers[0];

        firstBuffer.update(this.batchBuffer.byteIndex);

        bufferSystem.updateBuffer(firstBuffer);

        const commandEncoder = this.renderer.gpu.device.createCommandEncoder();

        for (let i = 1; i < this.buffers.length; i++)
        {
            const buffer = this.buffers[i];

            commandEncoder.copyBufferToBuffer(
                bufferSystem.getGPUBuffer(firstBuffer),
                minUniformOffsetAlignment,
                bufferSystem.getGPUBuffer(buffer),
                0,
                this.batchBuffer.byteIndex
            );
        }

        // TODO make a system that will que up all commands in to one array?
        this.renderer.gpu.device.queue.submit([commandEncoder.finish()]);

        // WEbGL code for if we ever need it..
        // const gl = this.renderer.gl as GlRenderingContext;

        // const srcBuffer = bufferSystem.updateBuffer(this.uboEven);

        // const dstBuffer = bufferSystem.updateBuffer(this.uboOdd);

        // gl.bindBuffer(gl.COPY_READ_BUFFER, srcBuffer.buffer);
        // gl.bindBuffer(gl.ARRAY_BUFFER, dstBuffer.buffer);

        // // console.warn('No GPU device');
        // gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.ARRAY_BUFFER, 0, 0, this.batchBuffer.byteIndex);
    }

    destroy()
    {
        for (let i = 0; i < this.bindGroups.length; i++)
        {
            this.bindGroups[i].destroy();
        }

        this.bindGroups = null;
        this.bindGroupHash = null;

        for (let i = 0; i < this.buffers.length; i++)
        {
            this.buffers[i].destroy();
        }
        this.buffers = null;

        for (let i = 0; i < this.bufferResources.length; i++)
        {
            this.bufferResources[i].destroy();
        }

        this.bufferResources = null;

        this.batchBuffer.destroy();
        this.bindGroupHash = null;

        this.renderer = null;
    }
}
