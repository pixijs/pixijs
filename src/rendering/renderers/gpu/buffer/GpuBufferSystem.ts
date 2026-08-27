import { ExtensionType } from '../../../../extensions/Extensions';
import { type GPUData } from '../../../../scene/view/ViewContainer';
import { GCManagedHash } from '../../../../utils/data/GCManagedHash';
import { fastCopy } from '../../shared/buffer/utils/fastCopy';

import type { Buffer } from '../../shared/buffer/Buffer';
import type { System } from '../../shared/system/System';
import type { GPU } from '../GpuDeviceSystem';
import type { WebGPURenderer } from '../WebGPURenderer';

const MAPPABLE_USAGE = 0x0001 | 0x0002; // GPUBufferUsage.MAP_READ | MAP_WRITE
const GPU_WRITTEN_USAGE = 0x0100 | 0x0200; // GPUBufferUsage.INDIRECT | QUERY_RESOLVE

/** @internal */
export class GpuBufferData implements GPUData
{
    public gpuBuffer: GPUBuffer;
    /** size/usage captured at creation so the buffer can be recycled even after the pixi Buffer is torn down */
    public readonly size: number;
    public readonly usage: number;

    constructor(gpuBuffer: GPUBuffer, size: number, usage: number)
    {
        this.gpuBuffer = gpuBuffer;
        this.size = size;
        this.usage = usage;
    }

    public destroy()
    {
        // the owning GpuBufferSystem may have taken the GPUBuffer for reuse
        this.gpuBuffer?.destroy();
        this.gpuBuffer = null;
    }
}

/**
 * System plugin to the renderer to manage buffers.
 *
 * Released `GPUBuffer`s (buffer resize, buffer destroy, GC unload) are pooled by
 * `size:usage` class and reused by {@link GpuBufferSystem#createGPUBuffer} instead of
 * hitting `device.createBuffer` again — in steady-state scenes that rebuild display
 * objects per frame this takes per-frame buffer allocation to ~zero. Reuse is
 * queue-order safe: a pooled buffer only becomes available after the frame that
 * released it has been submitted (see `postrender`), and its new contents are
 * written with `queue.writeBuffer`, which executes after all previously submitted
 * work on the same queue.
 * @category rendering
 * @advanced
 */
export class GpuBufferSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGPUSystem,
        ],
        name: 'buffer',
    } as const;

    /** The maximum total bytes of released GPU buffers kept for reuse. Overflow is destroyed instead of pooled. */
    public maxPooledBytes = 64 * 1024 * 1024;

    protected CONTEXT_UID: number;
    private readonly _renderer: WebGPURenderer;
    private readonly _managedBuffers: GCManagedHash<Buffer>;

    /** released GPUBuffers ready for reuse, keyed by `${size}:${usage}` */
    private readonly _pool: Map<string, GPUBuffer[]> = new Map();
    /** released this frame — becomes reusable only after this frame's submit */
    private readonly _pendingRecycle: { gpuBuffer: GPUBuffer; size: number; usage: number }[] = [];
    private _poolBytes = 0;
    private _scratch: Uint8Array | null = null;

    private _gpu: GPU;

    constructor(renderer: WebGPURenderer)
    {
        this._renderer = renderer;
        this._managedBuffers = new GCManagedHash({
            renderer,
            type: 'resource',
            onUnload: this.onBufferUnload.bind(this),
            name: 'gpuBuffer'
        });
    }

    protected contextChange(gpu: GPU): void
    {
        this._gpu = gpu;
        this._drainPool();
    }

    public getGPUBuffer(buffer: Buffer): GPUBuffer
    {
        buffer._gcLastUsed = this._renderer.gc.now;

        return (buffer._gpuData[this._renderer.uid] as GpuBufferData)?.gpuBuffer || this.createGPUBuffer(buffer);
    }

    public updateBuffer(buffer: Buffer): GPUBuffer
    {
        const gpuBuffer = this.getGPUBuffer(buffer);

        const data = buffer.data;

        // TODO this can be better...
        if (buffer._updateID && data)
        {
            buffer._updateID = 0;

            // make sure
            this._gpu.device.queue.writeBuffer(
                gpuBuffer,
                buffer._updateOffset,
                data.buffer,
                data.byteOffset + buffer._updateOffset,
                // round to the nearest 4 bytes
                ((buffer._updateSize || data.byteLength) + 3) & ~3
            );
        }

        return gpuBuffer;
    }

    /** dispose all WebGL resources of all managed buffers */
    public destroyAll(): void
    {
        this._managedBuffers.removeAll();
        this._drainPool();
    }

    protected onBufferUnload(buffer: Buffer): void
    {
        const gpuData = buffer._gpuData[this._renderer.uid] as GpuBufferData;

        if (gpuData?.gpuBuffer)
        {
            this._recycle(gpuData.gpuBuffer, gpuData.size, gpuData.usage);
            gpuData.gpuBuffer = null;
        }

        buffer.off('update', this.updateBuffer, this);
        buffer.off('change', this.onBufferChange, this);
    }

    public createGPUBuffer(buffer: Buffer): GPUBuffer
    {
        const { size, usage } = buffer.descriptor;
        let gpuBuffer = this._acquire(size, usage);

        if (gpuBuffer)
        {
            // restore fresh-buffer semantics: zero-initialised, then the CPU
            // data on top. queue.writeBuffer is queue-ordered, so overwriting
            // bytes still referenced by already-submitted work is safe.
            const scratch = this._zeroScratch(size);

            if (buffer.data)
            {
                const src = new Uint8Array(buffer.data.buffer, buffer.data.byteOffset, buffer.data.byteLength);

                scratch.set(src.byteLength > size ? src.subarray(0, size) : src);
            }

            this._gpu.device.queue.writeBuffer(gpuBuffer, 0, scratch.buffer, 0, size);
        }
        else
        {
            gpuBuffer = this._gpu.device.createBuffer(buffer.descriptor);

            if (buffer.data)
            {
                // TODO if data is static, this can be mapped at creation
                fastCopy(
                    buffer.data.buffer as ArrayBuffer,
                    gpuBuffer.getMappedRange(),
                    buffer.data.byteOffset,
                    buffer.data.byteLength
                );

                gpuBuffer.unmap();
            }
        }

        buffer._updateID = 0;

        buffer._gpuData[this._renderer.uid] = new GpuBufferData(gpuBuffer, size, usage);
        if (this._managedBuffers.add(buffer))
        {
            buffer.on('update', this.updateBuffer, this);
            buffer.on('change', this.onBufferChange, this);
        }

        return gpuBuffer;
    }

    protected onBufferChange(buffer: Buffer)
    {
        this._managedBuffers.remove(buffer);
        buffer._updateID = 0;
        this.createGPUBuffer(buffer);
    }

    /** makes buffers released during this frame available for reuse (the frame is submitted by now) */
    protected postrender(): void
    {
        const pending = this._pendingRecycle;

        for (let i = 0; i < pending.length; i++)
        {
            const { gpuBuffer, size, usage } = pending[i];
            const key = `${size}:${usage}`;
            let list = this._pool.get(key);

            if (!list) this._pool.set(key, list = []);
            list.push(gpuBuffer);
        }

        pending.length = 0;
    }

    private _poolable(size: number, usage: number): boolean
    {
        return size > 0
            && size % 4 === 0
            && (usage & (MAPPABLE_USAGE | GPU_WRITTEN_USAGE)) === 0;
    }

    private _recycle(gpuBuffer: GPUBuffer, size: number, usage: number): void
    {
        if (!this._poolable(size, usage) || this._poolBytes + size > this.maxPooledBytes)
        {
            gpuBuffer.destroy();

            return;
        }

        this._pendingRecycle.push({ gpuBuffer, size, usage });
        this._poolBytes += size;
    }

    private _acquire(size: number, usage: number): GPUBuffer | null
    {
        if (!this._poolable(size, usage)) return null;

        const list = this._pool.get(`${size}:${usage}`);

        if (!list?.length) return null;

        this._poolBytes -= size;

        return list.pop();
    }

    private _zeroScratch(size: number): Uint8Array
    {
        if (!this._scratch || this._scratch.byteLength < size)
        {
            this._scratch = new Uint8Array(size);
        }
        else
        {
            this._scratch.fill(0, 0, size);
        }

        return this._scratch;
    }

    private _drainPool(): void
    {
        for (const list of this._pool.values())
        {
            for (let i = 0; i < list.length; i++) list[i].destroy();
        }
        for (let i = 0; i < this._pendingRecycle.length; i++)
        {
            this._pendingRecycle[i].gpuBuffer.destroy();
        }
        this._pool.clear();
        this._pendingRecycle.length = 0;
        this._poolBytes = 0;
    }

    public destroy(): void
    {
        this._managedBuffers.destroy();
        this._drainPool();
        (this._renderer as null) = null;
        this._gpu = null;
        this._scratch = null;
    }
}
