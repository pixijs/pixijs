type TypedArray = Float32Array | Uint32Array | Int32Array | Uint8Array;

/**
 * Flexible wrapper around `ArrayBuffer` that also provides typed array views on demand.
 * @memberof utils
 */
export class ViewableBuffer
{
    /** The size of the buffer in bytes. */
    public size: number;

    /** Underlying `ArrayBuffer` that holds all the data and is of capacity `this.size`. */
    public rawBinaryData: ArrayBuffer;

    /** View on the raw binary data as a `Uint32Array`. */
    public uint32View: Uint32Array;

    /** View on the raw binary data as a `Float32Array`. */
    public float32View: Float32Array;
    public uint16View: Uint16Array;

    private _int8View: Int8Array;
    private _uint8View: Uint8Array;
    private _int16View: Int16Array;
    private _int32View: Int32Array;
    private _float64Array: Float64Array;
    private _bigUint64Array: BigUint64Array;

    /**
     * @param length - The size of the buffer in bytes.
     */
    constructor(length: number);

    /**
     * @param arrayBuffer - The source array buffer.
     */
    constructor(arrayBuffer: ArrayBuffer);

    constructor(sizeOrBuffer: number | ArrayBuffer | Uint8Array)
    {
        if (typeof sizeOrBuffer === 'number')
        {
            this.rawBinaryData = new ArrayBuffer(sizeOrBuffer);
        }
        else if (sizeOrBuffer instanceof Uint8Array)
        {
            this.rawBinaryData = sizeOrBuffer.buffer;
        }
        else
        {
            this.rawBinaryData = sizeOrBuffer;
        }

        this.uint32View = new Uint32Array(this.rawBinaryData);
        this.float32View = new Float32Array(this.rawBinaryData);

        this.size = this.rawBinaryData.byteLength;
    }

    /** View on the raw binary data as a `Int8Array`. */
    get int8View(): Int8Array
    {
        if (!this._int8View)
        {
            this._int8View = new Int8Array(this.rawBinaryData);
        }

        return this._int8View;
    }

    /** View on the raw binary data as a `Uint8Array`. */
    get uint8View(): Uint8Array
    {
        if (!this._uint8View)
        {
            this._uint8View = new Uint8Array(this.rawBinaryData);
        }

        return this._uint8View;
    }

    /**  View on the raw binary data as a `Int16Array`. */
    get int16View(): Int16Array
    {
        if (!this._int16View)
        {
            this._int16View = new Int16Array(this.rawBinaryData);
        }

        return this._int16View;
    }

    /** View on the raw binary data as a `Int32Array`. */
    get int32View(): Int32Array
    {
        if (!this._int32View)
        {
            this._int32View = new Int32Array(this.rawBinaryData);
        }

        return this._int32View;
    }

    /** View on the raw binary data as a `Float64Array`. */
    get float64View(): Float64Array
    {
        if (!this._float64Array)
        {
            this._float64Array = new Float64Array(this.rawBinaryData);
        }

        return this._float64Array;
    }

    /** View on the raw binary data as a `BigUint64Array`. */
    get bigUint64View(): BigUint64Array
    {
        if (!this._bigUint64Array)
        {
            this._bigUint64Array = new BigUint64Array(this.rawBinaryData);
        }

        return this._bigUint64Array;
    }

    /**
     * Returns the view of the given type.
     * @param type - One of `int8`, `uint8`, `int16`,
     *    `uint16`, `int32`, `uint32`, and `float32`.
     * @returns - typed array of given type
     */
    public view(type: string): TypedArray
    {
        return (this as any)[`${type}View`];
    }

    /** Destroys all buffer references. Do not use after calling this. */
    public destroy(): void
    {
        this.rawBinaryData = null;
        this._int8View = null;
        this._uint8View = null;
        this._int16View = null;
        this.uint16View = null;
        this._int32View = null;
        this.uint32View = null;
        this.float32View = null;
    }

    /**
     * Returns the size of the given type in bytes.
     * @param type - One of `int8`, `uint8`, `int16`,
     *   `uint16`, `int32`, `uint32`, and `float32`.
     * @returns - size of the type in bytes
     */
    public static sizeOf(type: string): number
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
