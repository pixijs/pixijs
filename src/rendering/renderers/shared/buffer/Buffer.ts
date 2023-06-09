import { Runner } from '../runner/Runner';
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

export class Buffer implements BindResource
{
    readonly resourceType = 'buffer';
    resourceId = generateUID();

    readonly uid = UID++;

    onUpdate = new Runner('onBufferUpdate');
    onDestroy = new Runner('onBufferDestroy');

    descriptor: BufferDescriptor;

    _updateID = 1;
    _updateSize: number;

    private _data: TypedArray;

    constructor({ data, size, usage, label }: BufferOptions)
    {
        if (data instanceof Array)
        {
            data = new Float32Array(data as number[]);
        }

        this._data = data as TypedArray;

        size = size ?? (data as TypedArray).byteLength;

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

    destroy()
    {
        this.onDestroy.emit(this);

        this.onUpdate.destroy();
        this.onDestroy.destroy();

        this.onUpdate = null;
        this.onDestroy = null;

        this._data = null;
        this.descriptor = null;
    }
}

