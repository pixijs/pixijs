import { ExtensionType } from '../../../../extensions/Extensions';
import { UniformBufferBatch } from '../../gpu/buffer/UniformBufferBatch';
import { BindGroup } from '../../gpu/shader/BindGroup';
import { Buffer } from '../buffer/Buffer';
import { BufferResource } from '../buffer/BufferResource';
import { BufferUsage } from '../buffer/const';

import type { ExtensionMetadata } from '../../../../extensions/Extensions';
import type { WebGPURenderer } from '../../gpu/WebGPURenderer';
import type { UniformGroup } from '../shader/UniformGroup';
import type { Instruction } from './Instruction';
import type { InstructionPipe } from './RenderPipe';

export interface UniformInstruction extends Instruction
{
    type: 'bundles';
    bundle: GPURenderBundle;
}

const minUniformOffsetAlignment = 128;// 256 / 2;

// TODO renderStart and renderFinish - perhaps just make them instructions to fit the architecture of the
// rest of the system
export class UniformBatchPipe implements InstructionPipe<UniformInstruction>
{
    /** @ignore */
    static extension: ExtensionMetadata = {
        type: [
            ExtensionType.WebGPURendererPipes,
        ],
        name: 'uniformBatch',
    };

    private renderer: WebGPURenderer;

    private hash: Record<number, BindGroup> = {};
    private batchBuffer: UniformBufferBatch;

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
        this.hash = {};
        this.batchBuffer.clear();
    }

    // just works for single bind groups for now
    getUniformBindGroup(group: UniformGroup<any>, duplicate: boolean): BindGroup
    {
        if (!duplicate && this.hash[group.uid])
        {
            return this.hash[group.uid];
        }

        // update the data..
        // TODO upload directly to the buffer...
        this.renderer.uniformBuffer.updateUniformGroup(group);

        const data = group.buffer.data as Float32Array;

        const offset = this.batchBuffer.addGroup(data);

        this.hash[group.uid] = this.getBindGroup(offset / minUniformOffsetAlignment);

        return this.hash[group.uid];
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
        // BOOM!
    }
}
