import Runner from 'mini-runner';

let UID = 0;
/* eslint-disable max-len */

/**
 * A wrapper for data so that it can be used and uploaded by webGL
 *
 * @class
 * @memberof PIXI
 */
export default class Buffer
{
    /**
     * @param {ArrayBuffer| SharedArrayBuffer|ArrayBufferView} data the data to store in the buffer.
     * @param {boolean} [_static=true] `true` for static buffer
     * @param {boolean} [index=false] `true` for index buffer
     * @param {boolean} [shared=false] if `true`, buffer will stay alive when geometry is disposed
     */
    constructor(data, _static = true, index = false, shared = false)
    {
        /**
         * The data in the buffer, as a typed array
         *
         * @member {ArrayBuffer| SharedArrayBuffer|ArrayBufferView}
         */
        this.data = data || new Float32Array(1);

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

        /**
         * If `true`, it wont be destroyed at the same time as geometry
         * @member {boolean}
         */
        this.shared = shared;

        this.id = UID++;

        this.disposeRunner = new Runner('disposeBuffer', 2);
    }

    // TODO could explore flagging only a partial upload?
    /**
     * flags this buffer as requiring an upload to the GPU
     */
    update(data)
    {
        this.data = data || this.data;
        this._updateID++;
    }

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    dispose()
    {
        this.disposeRunner.run(this, false);
    }

    /**
     * Destroys the buffer
     */
    destroy()
    {
        this.dispose();

        this.data = null;
    }

    /**
     * Marks this buffer as shared, it wont be disposed at the same time as geometry
     * @returns {PIXI.Buffer}
     */
    markShared()
    {
        this.shared = true;

        return this;
    }

    /**
     * Helper function that creates a buffer based on an array or TypedArray
     *
     * @static
     * @param {ArrayBufferView | number[]} data the TypedArray that the buffer will store. If this is a regular Array it will be converted to a Float32Array.
     * @return {PIXI.Buffer} A new Buffer based on the data provided.
     */
    static from(data)
    {
        if (data instanceof Array)
        {
            data = new Float32Array(data);
        }

        return new Buffer(data);
    }
}
