import { Runner } from '../runner/Runner';
import { generateUID } from '../texture/utils/generateUID';

import type { BindResource } from '../../gpu/shader/BindResource';
import type { BufferUsage } from './const';

// eslint-disable-next-line max-len
export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;

let UID = 0;

export interface BufferOptions
{
    data?: TypedArray;
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

export class Buffer implements BindResource
{
    resourceType = 'buffer';
    resourceId = generateUID();

    public uid = UID++;

    onUpdate = new Runner('onBufferUpdate');

    private _data: TypedArray;

    descriptor: BufferDescriptor;

    _updateID = 1;
    _updateSize: number;

    constructor({ data, size, usage, label }: BufferOptions)
    {
        this._data = data;

        size = size ?? data.byteLength;

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
            this._data = value;
            this.descriptor.size = value.byteLength;
            this.update();
        }
    }

    update(sizeInBytes?: number): void
    {
        this._updateSize = sizeInBytes || this.descriptor.size;
        this._updateID++;

        this.onUpdate.emit(this);
    }
}

