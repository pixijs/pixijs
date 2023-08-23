import EventEmitter from 'eventemitter3';
import { generateUID } from '../texture/utils/generateUID';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { BufferUsage } from './const';

// eslint-disable-next-line max-len
export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;

let UID = 0;

export interface BufferOptions
{
    data?: TypedArray | number[];
    size?: number;
    usage: number;
    label?: string;
}

export interface BufferDescriptor
{

    label?: string;
    size: GPUSize64;
    usage: BufferUsage;
    mappedAtCreation?: boolean;
}

export class Buffer extends EventEmitter<{
    change: BindResource,
    update: Buffer,
    destroy: Buffer,
}> implements BindResource
{
    public readonly resourceType = 'buffer';
    public resourceId = generateUID();

    public touched = 0;
    public readonly uid = UID++;

    public descriptor: BufferDescriptor;

    /** @internal */
    public _updateID = 1;
    /** @internal */
    public _updateSize: number;

    private _data: TypedArray;

    constructor({ data, size, usage, label }: BufferOptions)
    {
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
                this.resourceId = generateUID();

                this.emit('change', this);
            }
            else
            {
                this.emit('update', this);
            }
        }
    }

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
        this.descriptor = null;

        this.removeAllListeners();
    }
}

