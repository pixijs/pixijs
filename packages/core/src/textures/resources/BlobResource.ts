import { Resource } from './Resource';
import { ViewableBuffer } from '../../geometry/ViewableBuffer';
import { BufferResource } from './BufferResource';

interface IBlobOptions
{
    autoLoad?: boolean;
    width: number;
    height: number;
}

/**
 * Resource that fetches texture data over the network and stores it in a buffer.
 *
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 */
export abstract class BlobResource extends BufferResource
{
    protected origin: string;
    protected buffer: ViewableBuffer;
    protected loaded: boolean;

    /**
     * @param {string} url - the URL of the texture file
     * @param {boolean}[autoLoad] - whether to fetch the data immediately;
     *  you can fetch it later via {@link BlobResource#load}
     */
    constructor(source: string | Uint8Array | Uint32Array | Float32Array,
        options: IBlobOptions = { width: 1, height: 1, autoLoad: true })
    {
        let origin: string;
        let data: Uint8Array | Uint32Array | Float32Array;

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
         * @member {string}
         */
        this.origin = origin;

        /**
         * The viewable buffer on the data
         * @member {ViewableBuffer}
         */
        // HINT: BlobResource allows "null" sources, assuming the child class provides an alternative
        this.buffer = data ? new ViewableBuffer(data) : null;

        // Allow autoLoad = "undefined" still load the resource by default
        if (this.origin && options.autoLoad !== false)
        {
            this.load();
        }
        if (data && data.length)
        {
            this.loaded = true;
            this.onBlobLoaded(this.buffer.rawBinaryData);
        }
    }

    protected onBlobLoaded(_data: ArrayBuffer): void
    {
        // TODO: Override this method
    }

    /**
     * Loads the blob
     */
    async load(): Promise<Resource>
    {
        return fetch(this.origin)
            .then((res) => res.blob())
            .then((blob) => blob.arrayBuffer())
            .then((arrayBuffer) =>
            {
                this.data = new Uint32Array(arrayBuffer);
                this.buffer = new ViewableBuffer(arrayBuffer);
                this.loaded = true;

                this.onBlobLoaded(arrayBuffer);
                this.update();
            })
            .then(() => this);
    }
}
