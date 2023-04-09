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
    /** The URL of the texture file. */
    protected origin: string | null;

    /** The viewable buffer on the data. */
    protected buffer: ViewableBuffer | null;

    protected loaded: boolean;

    /**
     * Promise when loading.
     * @default null
     */
    private _load: Promise<this>;

    /**
     * @param source - The buffer/URL of the texture file.
     * @param {PIXI.IBlobOptions} [options]
     * @param {boolean} [options.autoLoad=false] - Whether to fetch the data immediately;
     *  you can fetch it later via {@link PIXI.BlobResource#load}.
     * @param {number} [options.width=1] - The width in pixels.
     * @param {number} [options.height=1] - The height in pixels.
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

        this.origin = origin;
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
