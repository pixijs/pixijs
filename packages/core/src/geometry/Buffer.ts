import { Runner } from '@pixi/runner';

import type { GLBuffer } from './GLBuffer';

let UID = 0;
/* eslint-disable max-len */

/**
 * Marks places in PixiJS where you can pass Float32Array, UInt32Array, any typed arrays, and ArrayBuffer
 *
 * Same as ArrayBuffer in typescript lib, defined here just for documentation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IArrayBuffer extends ArrayBuffer
{
}

/**
 * PixiJS classes use this type instead of ArrayBuffer and typed arrays
 * to support expressions like `geometry.buffers[0].data[0] = position.x`.
 *
 * Gives access to indexing and `length` field
 *
 * @popelyshev: If data is actually ArrayBuffer and throws Exception on indexing - its user problem :)
 */
export interface ITypedArray extends IArrayBuffer
{
    readonly length: number;
    [index: number]: number;
    readonly BYTES_PER_ELEMENT: number;
}

/**
 * A wrapper for data so that it can be used and uploaded by WebGL
 *
 * @class
 * @memberof PIXI
 */
export class Buffer
{
    public data: ITypedArray;
    public index: boolean;
    public static: boolean;
    public id: number;
     disposeRunner: Runner;
    _glBuffers: {[key: number]: GLBuffer};
    _updateID: number;
    /**
     * @param {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data the data to store in the buffer.
     * @param {boolean} [_static=true] `true` for static buffer
     * @param {boolean} [index=false] `true` for index buffer
     */
    constructor(data?: IArrayBuffer, _static = true, index = false)
    {
        /**
         * The data in the buffer, as a typed array
         *
         * @member {ArrayBuffer| SharedArrayBuffer | ArrayBufferView}
         */
        this.data = (data || new Float32Array(1)) as ITypedArray;

        /**
         * A map of renderer IDs to webgl buffer
         *
         * @private
         * @member {object<number, GLBuffer>}
         */
        this._glBuffers = {};

        this._updateID = 0;

        this.index = index;

        this.static = _static;

        this.id = UID++;

        this.disposeRunner = new Runner('disposeBuffer');
    }

    // TODO could explore flagging only a partial upload?
    /**
     * flags this buffer as requiring an upload to the GPU
     * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView} [data] the data to update in the buffer.
     */
    update(data?: IArrayBuffer): void
    {
        this.data = (data as ITypedArray) || this.data;
        this._updateID++;
    }

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    dispose(): void
    {
        this.disposeRunner.emit(this, false);
    }

    /**
     * Destroys the buffer
     */
    destroy(): void
    {
        this.dispose();

        this.data = null;
    }

    /**
     * Helper function that creates a buffer based on an array or TypedArray
     *
     * @static
     * @param {ArrayBufferView | number[]} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
     * @return {PIXI.Buffer} A new Buffer based on the data provided.
     */
    static from(data: IArrayBuffer | number[]): Buffer
    {
        if (data instanceof Array)
        {
            data = new Float32Array(data);
        }

        return new Buffer(data);
    }
}
