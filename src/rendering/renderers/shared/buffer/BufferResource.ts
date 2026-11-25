import EventEmitter from 'eventemitter3';
import { uid } from '../../../../utils/data/uid';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { Buffer } from './Buffer';

/**
 * A resource that can be bound to a bind group and used in a shader.
 * Whilst a buffer can be used as a resource, this class allows you to specify an offset and size of the buffer to use.
 * This is useful if you have a large buffer and only part of it is used in a shader.
 *
 * This resource listens for changes on the underlying buffer and emits a change itself if the buffer changes shape,
 * unless it is created with `watch: false`.
 * @example
 *
 * const buffer = new Buffer({
 *     data: new Float32Array(1000),
 *    usage: BufferUsage.UNIFORM,
 * });
 * // Create a buffer resource that uses the first 100 bytes of a buffer
 * const bufferResource = new BufferResource({
 *    buffer,
 *    offset: 0,
 *    size: 100,
 * });
 * @category rendering
 * @advanced
 */
export class BufferResource extends EventEmitter<{
    change: BindResource,
}> implements BindResource
{
    /**
     * emits when the underlying buffer has changed shape (i.e. resized)
     * letting the renderer know that it needs to discard the old buffer on the GPU and create a new one
     * @event change
     */

    /** a unique id for this uniform group used through the renderer */
    public readonly uid: number = uid('buffer');

    /**
     * a resource type, used to identify how to handle it when its in a bind group / shader resource
     * @internal
     */
    public readonly _resourceType = 'bufferResource';

    /**
     * the resource id used internally by the renderer to build bind group keys
     * @internal
     */
    public _resourceId = uid('resource');

    /** the underlying buffer that this resource is using */
    public buffer: Buffer;
    /**
     * the byte offset into the buffer this resource starts at, defaulting to 0.
     * Must be a multiple of `renderer.limits.minUniformBufferOffsetAlignment`.
     */
    public readonly offset: number;
    /** the number of bytes this resource covers. If not provided, it covers the rest of the buffer after `offset`. */
    public readonly size: number;
    /**
     * A cheeky hint to the GL renderer to let it know this is a BufferResource
     * @internal
     */
    public readonly _bufferResource = true;

    /**
     * Whether this resource listens to its buffer. See the `watch` constructor option.
     * @readonly
     */
    public readonly watch: boolean;

    /**
     * Has the Buffer resource been destroyed?
     * @readonly
     */
    public destroyed = false;

    /**
     * Create a new Buffer Resource.
     * @param options - The options for the buffer resource
     * @param options.buffer - The underlying buffer that this resource is using
     * @param options.offset - The byte offset into the buffer this resource starts at, defaulting to 0.
     * Must be a multiple of `renderer.limits.minUniformBufferOffsetAlignment`.
     * @param options.size - The number of bytes this resource covers.
     * If not provided, it covers the rest of the buffer after `offset`.
     * @param options.watch - Listen to the buffer, defaulting to true. A watched resource changes its id and
     * emits `change` when the buffer resizes, unloads or is destroyed, so the bind groups holding it rebuild.
     * Pass false when many resources share one buffer and every bind group holds them with
     * `BindGroup.setResourceUnwatched`, as thousands of listeners on one buffer cost memory and time to add and
     * remove. An unwatched resource keeps its id through those changes, so whoever owns it must
     * replace it with a new resource once the buffer changes, or bind groups keep using the old GPU buffer.
     */
    constructor({ buffer, offset, size, watch = true }: {
        buffer: Buffer;
        offset?: number;
        size?: number;
        watch?: boolean;
    })
    {
        super();

        this.buffer = buffer;
        this.offset = offset | 0;
        this.size = size;
        this.watch = watch;

        if (watch) this.buffer.on('change', this.onBufferChange, this);
    }

    /**
     * The GC tracks the underlying buffer, not this resource — a GC stamp here (see
     * BindGroup._touch) must land on the buffer, or the GC collects it while cached
     * bind groups still reference it.
     * @internal
     */
    get _gcLastUsed(): number
    {
        return this.buffer?._gcLastUsed ?? -1;
    }

    set _gcLastUsed(value: number)
    {
        if (this.buffer) this.buffer._gcLastUsed = value;
    }

    protected onBufferChange(): void
    {
        this._resourceId = uid('resource');

        this.emit('change', this);
    }

    /**
     * Destroys this resource. Make sure the underlying buffer is not used anywhere else
     * if you want to destroy it as well, or code will explode
     * @param destroyBuffer - Should the underlying buffer be destroyed as well?
     */
    public destroy(destroyBuffer = false): void
    {
        this.destroyed = true;

        if (destroyBuffer)
        {
            this.buffer.destroy();
        }

        this.emit('change', this);

        if (this.watch) this.buffer.off('change', this.onBufferChange, this);
        this.buffer = null;
        this.removeAllListeners();
    }
}
