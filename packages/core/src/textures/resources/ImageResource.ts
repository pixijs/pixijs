import { BaseImageResource } from './BaseImageResource';
import { settings } from '@pixi/settings';
import { ALPHA_MODES } from '@pixi/constants';

import type { BaseTexture } from '../BaseTexture';
import type { Renderer } from '../../Renderer';
import type { GLTexture } from '../GLTexture';

export interface IImageResourceOptions
{
    /** Start loading process */
    autoLoad?: boolean;

    /** Whether its required to create a bitmap before upload. */
    createBitmap?: boolean;

    /** Load image using cross origin. */
    crossorigin?: boolean|string;

    /** Premultiply image alpha in bitmap. */
    alphaMode?: ALPHA_MODES;
}

/**
 * Resource type for HTMLImageElement.
 *
 * @memberof PIXI
 */
export class ImageResource extends BaseImageResource
{
    /** URL of the image source */
    url: string;

    /**
     * If the image should be disposed after upload
     *
     * @default false
     */
    preserveBitmap: boolean;

    /**
     * If capable, convert the image using createImageBitmap API.
     *
     * @default PIXI.settings.CREATE_IMAGE_BITMAP
     */
    createBitmap: boolean;

    /**
     * Controls texture alphaMode field
     * Copies from options
     * Default is `null`, copies option from baseTexture
     *
     * @readonly
     */
    alphaMode: ALPHA_MODES;

    /**
     * The ImageBitmap element created for a {@code HTMLImageElement}.
     *
     * @default null
     */
    bitmap: ImageBitmap;

    /**
     * Promise when loading.
     *
     * @default null
     */
    private _load: Promise<ImageResource>;

    /** When process is completed */
    private _process: Promise<ImageResource>;

    /**
     * @param source - image source or URL
     * @param options
     * @param {boolean} [options.autoLoad=true] - start loading process
     * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] - whether its required to create
     *        a bitmap before upload
     * @param {boolean} [options.crossorigin=true] - Load image using cross origin
     * @param {PIXI.ALPHA_MODES} [options.alphaMode=PIXI.ALPHA_MODES.UNPACK] - Premultiply image alpha in bitmap
     */
    constructor(source: HTMLImageElement|string, options?: IImageResourceOptions)
    {
        options = options || {};

        if (!(source instanceof HTMLImageElement))
        {
            const imageElement = new Image();

            BaseImageResource.crossOrigin(imageElement, source, options.crossorigin);

            imageElement.src = source;
            source = imageElement;
        }

        super(source);

        // FireFox 68, and possibly other versions, seems like setting the HTMLImageElement#width and #height
        // to non-zero values before its loading completes if images are in a cache.
        // Because of this, need to set the `_width` and the `_height` to zero to avoid uploading incomplete images.
        // Please refer to the issue #5968 (https://github.com/pixijs/pixi.js/issues/5968).
        if (!source.complete && !!this._width && !!this._height)
        {
            this._width = 0;
            this._height = 0;
        }

        this.url = source.src;

        this._process = null;

        this.preserveBitmap = false;
        this.createBitmap = (options.createBitmap !== undefined
            ? options.createBitmap : settings.CREATE_IMAGE_BITMAP) && !!globalThis.createImageBitmap;
        this.alphaMode = typeof options.alphaMode === 'number' ? options.alphaMode : null;
        this.bitmap = null;

        this._load = null;

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    /**
     * Returns a promise when image will be loaded and processed.
     *
     * @param createBitmap - whether process image into bitmap
     */
    load(createBitmap?: boolean): Promise<ImageResource>
    {
        if (this._load)
        {
            return this._load;
        }

        if (createBitmap !== undefined)
        {
            this.createBitmap = createBitmap;
        }

        this._load = new Promise((resolve, reject): void =>
        {
            const source = this.source as HTMLImageElement;

            this.url = source.src;

            const completed = (): void =>
            {
                if (this.destroyed)
                {
                    return;
                }
                source.onload = null;
                source.onerror = null;

                this.resize(source.width, source.height);
                this._load = null;

                if (this.createBitmap)
                {
                    resolve(this.process());
                }
                else
                {
                    resolve(this);
                }
            };

            if (source.complete && source.src)
            {
                completed();
            }
            else
            {
                source.onload = completed;
                source.onerror = (event): void =>
                {
                    // Avoids Promise freezing when resource broken
                    reject(event);
                    this.onError.emit(event);
                };
            }
        });

        return this._load;
    }

    /**
     * Called when we need to convert image into BitmapImage.
     * Can be called multiple times, real promise is cached inside.
     *
     * @return - Cached promise to fill that bitmap
     */
    process(): Promise<ImageResource>
    {
        const source = this.source as HTMLImageElement;

        if (this._process !== null)
        {
            return this._process;
        }
        if (this.bitmap !== null || !globalThis.createImageBitmap)
        {
            return Promise.resolve(this);
        }

        const createImageBitmap = globalThis.createImageBitmap as any;
        const cors = !source.crossOrigin || source.crossOrigin === 'anonymous';

        this._process = fetch(source.src,
            {
                mode: cors ? 'cors' : 'no-cors'
            })
            .then((r) => r.blob())
            .then((blob) => createImageBitmap(blob,
                0, 0, source.width, source.height,
                {
                    premultiplyAlpha: this.alphaMode === ALPHA_MODES.UNPACK ? 'premultiply' : 'none',
                }))
            .then((bitmap: ImageBitmap) =>
            {
                if (this.destroyed)
                {
                    return Promise.reject();
                }
                this.bitmap = bitmap;
                this.update();
                this._process = null;

                return Promise.resolve(this);
            });

        return this._process;
    }

    /**
     * Upload the image resource to GPU.
     *
     * @param renderer - Renderer to upload to
     * @param baseTexture - BaseTexture for this resource
     * @param glTexture - GLTexture to use
     * @returns {boolean} true is success
     */
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture): boolean
    {
        if (typeof this.alphaMode === 'number')
        {
            // bitmap stores unpack premultiply flag, we dont have to notify texImage2D about it

            baseTexture.alphaMode = this.alphaMode;
        }

        if (!this.createBitmap)
        {
            return super.upload(renderer, baseTexture, glTexture);
        }
        if (!this.bitmap)
        {
            // yeah, ignore the output
            this.process();
            if (!this.bitmap)
            {
                return false;
            }
        }

        super.upload(renderer, baseTexture, glTexture, this.bitmap);

        if (!this.preserveBitmap)
        {
            // checks if there are other renderers that possibly need this bitmap

            let flag = true;

            const glTextures = baseTexture._glTextures;

            for (const key in glTextures)
            {
                const otherTex = glTextures[key];

                if (otherTex !== glTexture && otherTex.dirtyId !== baseTexture.dirtyId)
                {
                    flag = false;
                    break;
                }
            }

            if (flag)
            {
                if (this.bitmap.close)
                {
                    this.bitmap.close();
                }

                this.bitmap = null;
            }
        }

        return true;
    }

    /** Destroys this resource. */
    dispose(): void
    {
        (this.source as HTMLImageElement).onload = null;
        (this.source as HTMLImageElement).onerror = null;

        super.dispose();

        if (this.bitmap)
        {
            this.bitmap.close();
            this.bitmap = null;
        }
        this._process = null;
        this._load = null;
    }

    /**
     * Used to auto-detect the type of resource.
     *
     * @param {*} source - The source object
     * @return {boolean} `true` if source is string or HTMLImageElement
     */
    static test(source: unknown): source is string|HTMLImageElement
    {
        return typeof source === 'string' || source instanceof HTMLImageElement;
    }
}
