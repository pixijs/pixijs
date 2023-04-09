import { BufferResource, ViewableBuffer } from '@pixi/core';

import type { BufferType } from '@pixi/core';

interface IBlobOptions
{
    autoLoad?: boolean;
    width: number;
    height: number;
}

/**
 * Resource that fetches texture data over the network and stores it in a buffer.
 * @class
 * @extends PIXI.Resource
 * @memberof PIXI
 */
export abstract class BlobResource extends BufferResource
{
    protected origin: string | null;
    protected buffer: ViewableBuffer | null;
    protected loaded: boolean;

    /**
     * Promise when loading.
     * @default null
     */
    private _load: Promise<this>;

    /**
     * @param source - the buffer/URL of the texture file
     * @param {PIXI.IBlobOptions} options
     * @param {boolean}[options.autoLoad] - whether to fetch the data immediately;
     *  you can fetch it later via {@link PIXI.BlobResource#load}
     * @param {boolean}[options.width] - the width in pixels.
     * @param {boolean}[options.height] - the height in pixels.
     */
    constructor(source: string | BufferType, options: IBlobOptions = { width: 1, height: 1, autoLoad: true })
    {
        let origin: string | null;
        let data: BufferType;

        if (typeof source === 'string')
        {
            origin = source;
            data = new Uint8Array();
        }
        else
        {
            origin = null;
            data = source;
        }

        super(data, options);

        /**
         * The URL of the texture file
         * @type {string|null}
         */
        this.origin = origin;

        /**
         * The viewable buffer on the data
         * @type {ViewableBuffer|null}
         */
        // HINT: BlobResource allows "null" sources, assuming the child class provides an alternative
        this.buffer = data ? new ViewableBuffer(data) : null;

        this._load = null;
        this.loaded = false;

        // Allow autoLoad = "undefined" still load the resource by default
        if (this.origin !== null && options.autoLoad !== false)
        {
            this.load();
        }
        if (this.origin === null && this.buffer)
        {
            this._load = Promise.resolve(this);
            this.loaded = true;
            this.onBlobLoaded(this.buffer.rawBinaryData);
        }
    }

    protected onBlobLoaded(_data: ArrayBuffer): void
    {
        // TODO: Override this method
    }

    /** Loads the blob */
    load(): Promise<this>
    {
        if (this._load)
        {
            return this._load;
        }

        this._load = fetch(this.origin)
            .then((response) => response.blob())
            .then((blob) => blob.arrayBuffer())
            .then((arrayBuffer) =>
            {
                this.data = new Uint32Array(arrayBuffer);
                this.buffer = new ViewableBuffer(arrayBuffer);
                this.loaded = true;

                this.onBlobLoaded(arrayBuffer);
                this.update();

                return this;
            });

        return this._load;
    }
}
