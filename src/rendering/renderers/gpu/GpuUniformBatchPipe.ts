import { ExtensionType } from '../../../extensions/Extensions';
import { Buffer } from '../shared/buffer/Buffer';
import { BufferResource } from '../shared/buffer/BufferResource';
import { BufferUsage } from '../shared/buffer/const';
import { UboBatch } from './buffer/UboBatch';
import { BindGroup } from './shader/BindGroup';

import type { UniformGroup } from '../shared/shader/UniformGroup';
import type { WebGPURenderer } from './WebGPURenderer';

const minUniformOffsetAlignment = 128;// 256 / 2;

// TODO renderStart and renderFinish - perhaps just make them instructions to fit the architecture of the
// rest of the system
export class GpuUniformBatchPipe
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUPipes,
        ],
        name: 'uniformBatch',
    } as const;

    private _renderer: WebGPURenderer;

    private _bindGroupHash: Record<number, BindGroup> = Object.create(null);
    private readonly _batchBuffer: UboBatch;

    // number of buffers..
    private _buffers: Buffer[] = [];

    private _bindGroups: BindGroup[] = [];
    private _bufferResources: BufferResource[] = [];

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        this._renderer.renderableGC.addManagedHash(this, '_bindGroupHash');

        this._batchBuffer = new UboBatch({ minUniformOffsetAlignment });

        const totalBuffers = (256 / minUniformOffsetAlignment);

        for (let i = 0; i < totalBuffers; i++)
        {
            let usage = BufferUsage.UNIFORM | BufferUsage.COPY_DST;

            if (i === 0) usage |= BufferUsage.COPY_SRC;

            this._buffers.push(new Buffer({
                data: this._batchBuffer.data,
                usage
            }));
        }
    }

    public renderEnd()
    {
        this._uploadBindGroups();
        this._resetBindGroups();
    }

    private _resetBindGroups()
    {
        for (const i in this._bindGroupHash)
        {
            this._bindGroupHash[i] = null;
        }

        this._batchBuffer.clear();
    }

    // just works for single bind groups for now
    public getUniformBindGroup(group: UniformGroup<any>, duplicate: boolean): BindGroup
    {
        if (!duplicate && this._bindGroupHash[group.uid])
        {
            return this._bindGroupHash[group.uid];
        }

        this._renderer.ubo.ensureUniformGroup(group);

        const data = group.buffer.data as Float32Array;

        const offset = this._batchBuffer.addEmptyGroup(data.length);

        this._renderer.ubo.syncUniformGroup(group, this._batchBuffer.data, offset / 4);

        this._bindGroupHash[group.uid] = this._getBindGroup(offset / minUniformOffsetAlignment);

        return this._bindGroupHash[group.uid];
    }

    public getUboResource(group: UniformGroup<any>): BufferResource
    {
        this._renderer.ubo.updateUniformGroup(group);

        const data = group.buffer.data as Float32Array;

        const offset = this._batchBuffer.addGroup(data);

        return this._getBufferResource(offset / minUniformOffsetAlignment);
    }

    public getArrayBindGroup(data: Float32Array): BindGroup
    {
        const offset = this._batchBuffer.addGroup(data);

        return this._getBindGroup(offset / minUniformOffsetAlignment);
    }

    public getArrayBufferResource(data: Float32Array): BufferResource
    {
        const offset = this._batchBuffer.addGroup(data);

        const index = offset / minUniformOffsetAlignment;

        return this._getBufferResource(index);
    }

    private _getBufferResource(index: number): BufferResource
    {
        if (!this._bufferResources[index])
        {
            const buffer = this._buffers[index % 2];

            this._bufferResources[index] = new BufferResource({
                buffer,
                offset: ((index / 2) | 0) * 256,
                size: minUniformOffsetAlignment
            });
        }

        return this._bufferResources[index];
    }

    private _getBindGroup(index: number): BindGroup
    {
        if (!this._bindGroups[index])
        {
            // even!
            const bindGroup = new BindGroup({
                0: this._getBufferResource(index),
            });

            this._bindGroups[index] = bindGroup;
        }

        return this._bindGroups[index];
    }

    private _uploadBindGroups()
    {
        const bufferSystem = this._renderer.buffer;

        const firstBuffer = this._buffers[0];

        firstBuffer.update(this._batchBuffer.byteIndex);

        bufferSystem.updateBuffer(firstBuffer);

        const commandEncoder = this._renderer.gpu.device.createCommandEncoder();

        for (let i = 1; i < this._buffers.length; i++)
        {
            const buffer = this._buffers[i];

            commandEncoder.copyBufferToBuffer(
                bufferSystem.getGPUBuffer(firstBuffer),
                minUniformOffsetAlignment,
                bufferSystem.getGPUBuffer(buffer),
                0,
                this._batchBuffer.byteIndex
            );
        }

        // TODO make a system that will que up all commands in to one array?
        this._renderer.gpu.device.queue.submit([commandEncoder.finish()]);
    }

    public destroy()
    {
        for (let i = 0; i < this._bindGroups.length; i++)
        {
            this._bindGroups[i].destroy();
        }

        this._bindGroups = null;
        this._bindGroupHash = null;

        for (let i = 0; i < this._buffers.length; i++)
        {
            this._buffers[i].destroy();
        }
        this._buffers = null;

        for (let i = 0; i < this._bufferResources.length; i++)
        {
            this._bufferResources[i].destroy();
        }

        this._bufferResources = null;

        this._batchBuffer.destroy();
        this._bindGroupHash = null;

        this._renderer = null;
    }
}
