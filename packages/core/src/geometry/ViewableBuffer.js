/**
 * Flexible wrapper around `ArrayBuffer` that also provides
 * typed array views on demand.
 *
 * @class
 * @memberof PIXI
 */
export class ViewableBuffer
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
         * View on the raw binary data as a `Uint32Array`.
         *
         * @member {Uint32Array}
         */
        this.uint32View = new Uint32Array(this.rawBinaryData);

        /**
         * View on the raw binary data as a `Float32Array`.
         *
         * @member {Float32Array}
         */
        this.float32View = new Float32Array(this.rawBinaryData);
    }

    /**
     * View on the raw binary data as a `Int8Array`.
     *
     * @member {Int8Array}
     */
    get int8View()
    {
        if (!this._int8View)
        {
            this._int8View = new Int8Array(this.rawBinaryData);
        }

        return this._int8View;
    }

    /**
     * View on the raw binary data as a `Uint8Array`.
     *
     * @member {Uint8Array}
     */
    get uint8View()
    {
        if (!this._uint8View)
        {
            this._uint8View = new Uint8Array(this.rawBinaryData);
        }

        return this._uint8View;
    }

    /**
     * View on the raw binary data as a `Int16Array`.
     *
     * @member {Int16Array}
     */
    get int16View()
    {
        if (!this._int16View)
        {
            this._int16View = new Int16Array(this.rawBinaryData);
        }

        return this._int16View;
    }

    /**
     * View on the raw binary data as a `Uint16Array`.
     *
     * @member {Uint16Array}
     */
    get uint16View()
    {
        if (!this._uint16View)
        {
            this._uint16View = new Uint16Array(this.rawBinaryData);
        }

        return this._uint16View;
    }

    /**
     * View on the raw binary data as a `Int32Array`.
     *
     * @member {Int32Array}
     */
    get int32View()
    {
        if (!this._int32View)
        {
            this._int32View = new Int32Array(this.rawBinaryData);
        }

        return this._int32View;
    }

    /**
     * Returns the view of the given type.
     *
     * @param {string} type - One of `int8`, `uint8`, `int16`,
     *    `uint16`, `int32`, `uint32`, and `float32`.
     * @return {object} typed array of given type
     */
    view(type)
    {
        return this[`${type}View`];
    }

    /**
     * Destroys all buffer references. Do not use after calling
     * this.
     */
    destroy()
    {
        this.rawBinaryData = null;
        this._int8View = null;
        this._uint8View = null;
        this._int16View = null;
        this._uint16View = null;
        this._int32View = null;
        this.uint32View = null;
        this.float32View = null;
    }

    static sizeOf(type)
    {
        switch (type)
        {
            case 'int8':
            case 'uint8':
                return 1;
            case 'int16':
            case 'uint16':
                return 2;
            case 'int32':
            case 'uint32':
            case 'float32':
                return 4;
            default:
                throw new Error(`${type} isn't a valid view type`);
        }
    }
}
