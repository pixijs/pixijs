import EventEmitter from 'eventemitter3';
import { uid } from '../../../../utils/data/uid';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { BufferUsage } from './const';

/** All the various typed arrays that exist in js */
// eslint-disable-next-line max-len
export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;

/** Options for creating a buffer */
export interface BufferOptions
{
    /**
     * the data to initialize the buffer with, this can be a typed array,
     * or a regular number array. If it is a number array, it will be converted to a Float32Array
     */
    data?: TypedArray | number[];
    /** the size of the buffer in bytes, if not supplied, it will be inferred from the data */
    size?: number;
    /** the usage of the buffer, see {@link rendering.BufferUsage} */
    usage: number;
    /** a label for the buffer, this is useful for debugging */
    label?: string;
}

export interface BufferDescriptor
{
    label?: string;
    size: GPUSize64;
    usage: BufferUsage;
    mappedAtCreation?: boolean;
}

/**
 * A wrapper for a WebGPU/WebGL Buffer.
 * In PixiJS, the Buffer class is used to manage the data that is sent to the GPU rendering pipeline.
 * It abstracts away the underlying GPU buffer and provides an interface for uploading typed arrays or other data to the GPU,
 * They are used in the following places:
 * <br><br>
 * .1. {@link Geometry} as attribute data or index data for geometry
 * <br>
 * .2. {@link UniformGroup} as an underlying buffer for uniform data
 * <br>
 * .3. {@link BufferResource} as an underlying part of a buffer used directly by the GPU program
 * <br>
 *
 * It is important to note that you must provide a usage type when creating a buffer. This is because
 * the underlying GPU buffer needs to know how it will be used. For example, if you are creating a buffer
 * to hold vertex data, you would use `BufferUsage.VERTEX`. This will tell the GPU that this buffer will be
 * used as a vertex buffer. This is important because it will affect how you can use the buffer.
 *
 * Buffers are updated by calling the {@link Buffer.update} method. This immediately updates the buffer on the GPU.
 * Be mindful of calling this more often than you need to. It is recommended to update buffers only when needed.
 *
 * In WebGPU, a GPU buffer cannot resized. This limitation is abstracted away, but know that resizing a buffer means
 * creating a brand new one and destroying the old, so it is best to limit this if possible.
 * @example
 *
 * const buffer = new Buffer({
 *     data: new Float32Array([1, 2, 3, 4]),
 *     usage: BufferUsage.VERTEX,
 * });
 * @memberof rendering
 */
export class Buffer extends EventEmitter<{
    change: BindResource,
    update: Buffer,
    destroy: Buffer,
}> implements BindResource
{
    /**
     * emits when the underlying buffer has changed shape (i.e. resized)
     * letting the renderer know that it needs to discard the old buffer on the GPU and create a new one
     * @event change
     */

    /**
     * emits when the underlying buffer data has been updated. letting the renderer know
     * that it needs to update the buffer on the GPU
     * @event update
     */

    /**
     * emits when the buffer is destroyed. letting the renderer know that it needs to destroy the buffer on the GPU
     * @event destroy
     */

    /**
     * a unique id for this uniform group used through the renderer
     * @internal
     * @ignore
     */
    public readonly uid = uid('buffer');

    /**
     * a resource type, used to identify how to handle it when its in a bind group / shader resource
     * @internal
     * @ignore
     */
    public readonly _resourceType = 'buffer';

    /**
     * the resource id used internally by the renderer to build bind group keys
     * @internal
     * @ignore
     */
    public _resourceId = uid('bufferResource');

    /**
     * used internally to know if a uniform group was used in the last render pass
     * @internal
     * @ignore
     */
    public _touched = 0;

    /**
     * a description of the buffer and how it should be set up on the GPU
     * @internal
     * @ignore
     */
    public readonly descriptor: BufferDescriptor;

    /**
     * @internal
     * @ignore
     */
    public _updateID = 1;

    /**
     * @internal
     * @ignore
     */
    public _updateSize: number;

    private _data: TypedArray;

    /**
     * Creates a new Buffer with the given options
     * @param options - the options for the buffer
     */
    constructor(options: BufferOptions)
    {
        let { data, size } = options;
        const { usage, label } = options;

        super();

        if (data instanceof Array)
        {
            data = new Float32Array(data as number[]);
        }

        this._data = data as TypedArray;

        size = size ?? (data as TypedArray)?.byteLength;

        const mappedAtCreation = !!data;

        this.descriptor = {
            size,
            usage,
            mappedAtCreation,
            label,
        };
    }

    /** @todo */
    get data()
    {
        return this._data;
    }

    set data(value: TypedArray)
    {
        if (this._data !== value)
        {
            const oldData = this._data;

            this._data = value;

            if (oldData.length !== value.length)
            {
                this.descriptor.size = value.byteLength;
                this._resourceId = uid('bufferResource');

                this.emit('change', this);
            }
            else
            {
                this.emit('update', this);
            }
        }
    }

    /**
     * updates the buffer on the GPU to reflect the data in the buffer.
     * By default it will update the entire buffer. If you only want to update a subset of the buffer,
     * you can pass in the size of the buffer to update.
     * @param sizeInBytes - the new size of the buffer in bytes
     */
    public update(sizeInBytes?: number): void
    {
        this._updateSize = sizeInBytes || this.descriptor.size;
        this._updateID++;

        this.emit('update', this);
    }

    public destroy()
    {
        this.emit('destroy', this);

        this._data = null;
        (this.descriptor as any) = null;

        this.removeAllListeners();
    }
}

