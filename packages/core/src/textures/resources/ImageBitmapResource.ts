import { ALPHA_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { BaseImageResource } from './BaseImageResource';

import type { ICanvas } from '@pixi/settings';
import type { Renderer } from '../../Renderer';
import type { BaseTexture } from '../BaseTexture';
import type { GLTexture } from '../GLTexture';

export interface IImageBitmapResourceOptions
{
    /** Start loading process automatically when constructed. */
    autoLoad?: boolean;

    /** Load image using cross origin. */
    crossOrigin?: boolean;

    /** Alpha mode used when creating the ImageBitmap. */
    alphaMode?: ALPHA_MODES;
}

/**
 * Resource type for ImageBitmap.
 * @memberof PIXI
 */
export class ImageBitmapResource extends BaseImageResource
{
    /** URL of the image source. */
    url: string | null;

    /**
     * Load image using cross origin.
     * @default false
     */
    crossOrigin: boolean;

    /**
     * Controls texture alphaMode field
     * Copies from options
     * Default is `null`, copies option from baseTexture
     * @readonly
     */
    alphaMode: ALPHA_MODES | null;

    /**
     * Promise when loading.
     * @default null
     */
    private _load: Promise<ImageBitmapResource>;

    /**
     * @param source - ImageBitmap or URL to use
     * @param options
     * @param {boolean} [options.autoLoad=true] - Start loading process automatically when constructed.
     * @param {boolean} [options.crossOrigin=true] - Load image using cross origin.
     * @param {PIXI.ALPHA_MODES} [options.alphaMode=null] - Alpha mode used when creating the ImageBitmap.
     */
    constructor(source: ImageBitmap | string, options?: IImageBitmapResourceOptions)
    {
        options = options || {};

        let baseSource;
        let url;

        if (typeof source === 'string')
        {
            baseSource = ImageBitmapResource.EMPTY;
            url = source;
        }
        else
        {
            baseSource = source;
            url = null;
        }
        // Using super() in if() can cause transpilation problems in some cases, so take it out of if().
        // See https://github.com/pixijs/pixijs/pull/9093 for details.
        super(baseSource);
        this.url = url;

        this.crossOrigin = options.crossOrigin ?? true;
        this.alphaMode = typeof options.alphaMode === 'number' ? options.alphaMode : null;

        this._load = null;

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    load(): Promise<ImageBitmapResource>
    {
        if (this._load)
        {
            return this._load;
        }

        this._load = new Promise(async (resolve, reject) =>
        {
            if (this.url === null)
            {
                resolve(this);

                return;
            }

            try
            {
                const response = await settings.ADAPTER.fetch(this.url, {
                    mode: this.crossOrigin ? 'cors' : 'no-cors'
                });

                if (this.destroyed) return;

                const imageBlob = await response.blob();

                if (this.destroyed) return;

                const imageBitmap = await createImageBitmap(imageBlob, {
                    premultiplyAlpha: this.alphaMode === null || this.alphaMode === ALPHA_MODES.UNPACK
                        ? 'premultiply' : 'none',
                });

                if (this.destroyed) return;

                this.source = imageBitmap;
                this.update();

                resolve(this);
            }
            catch (e)
            {
                if (this.destroyed) return;

                reject(e);
                this.onError.emit(e);
            }
        });

        return this._load;
    }

    /**
     * Upload the image bitmap resource to GPU.
     * @param renderer - Renderer to upload to
     * @param baseTexture - BaseTexture for this resource
     * @param glTexture - GLTexture to use
     * @returns {boolean} true is success
     */
    override upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        if (!(this.source instanceof ImageBitmap))
        {
            this.load();

            return false;
        }

        if (typeof this.alphaMode === 'number')
        {
            baseTexture.alphaMode = this.alphaMode;
        }

        return super.upload(renderer, baseTexture, glTexture);
    }

    /** Destroys this resource. */
    override dispose(): void
    {
        if (this.source instanceof ImageBitmap)
        {
            this.source.close();
        }

        super.dispose();

        this._load = null;
    }

    /**
     * Used to auto-detect the type of resource.
     * @param {*} source - The source object
     * @returns {boolean} `true` if current environment support ImageBitmap, and source is string or ImageBitmap
     */
    static override test(source: unknown): source is string | ImageBitmap
    {
        return !!globalThis.createImageBitmap && typeof ImageBitmap !== 'undefined'
            && (typeof source === 'string' || source instanceof ImageBitmap);
    }

    /**
     * Cached empty placeholder canvas.
     * @see EMPTY
     */
    private static _EMPTY: ICanvas;

    /**
     * ImageBitmap cannot be created synchronously, so a empty placeholder canvas is needed when loading from URLs.
     * Only for internal usage.
     * @returns The cached placeholder canvas.
     */
    private static get EMPTY(): ICanvas
    {
        ImageBitmapResource._EMPTY = ImageBitmapResource._EMPTY ?? settings.ADAPTER.createCanvas(0, 0);

        return ImageBitmapResource._EMPTY;
    }
}
