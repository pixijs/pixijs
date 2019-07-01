/**
 * `ArrayBuffer` wrapper with float32 and uint32 views. It
 * is used by `AbstractBatchRenderer` to store interleaved
 * object geometries.
 *
 * @class
 * @memberof PIXI
 */
export default class BatchBuffer
{
    /**
     * @param {number} size - The size of the buffer in bytes.
     */
    constructor(size)
    {
        /**
         * Underlying `ArrayBuffer` that holds all the data
         * and is of capacity `size`.
         *
         * @member {ArrayBuffer}
         */
        this.rawBinaryData = new ArrayBuffer(size);

        /**
         * View on the raw binary data as a `Float32Array`.
         *
         * @member {Float32Array}
         */
        this.float32View = new Float32Array(this.rawBinaryData);

        /**
         * View on the raw binary data as a `Uint32Array`.
         *
         * @member {Uint32Array}
         */
        this.uint32View = new Uint32Array(this.rawBinaryData);
    }

    /**
     * Destroys all buffer references.
     */
    destroy()
    {
        this.rawBinaryData = null;
        this.float32View = null;
        this.uint32View = null;
    }
}
