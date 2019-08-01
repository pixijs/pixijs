import { BaseImageResource } from './BaseImageResource';
import { settings } from '@pixi/settings';

/**
 * Resource type for HTMLImageElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 */
export class ImageResource extends BaseImageResource
{
    /**
     * @param {HTMLImageElement|string} source - image source or URL
     * @param {boolean} [options.autoLoad=true] start loading process
     * @param {boolean} [options.createBitmap=PIXI.settings.CREATE_IMAGE_BITMAP] whether its required to create
     *        a bitmap before upload
     * @param {boolean} [options.crossorigin=true] - Load image using cross origin
     * @param {boolean} [options.premultiplyAlpha=true] - Premultiply image alpha in bitmap
     */
    constructor(source, options)
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

        /**
         * URL of the image source
         * @member {string}
         */
        this.url = source.src;

        /**
         * When process is completed
         * @member {Promise<void>}
         * @private
         */
        this._process = null;

        /**
         * If the image should be disposed after upload
         * @member {boolean}
         * @default false
         */
        this.preserveBitmap = false;

        /**
         * If capable, convert the image using createImageBitmap API
         * @member {boolean}
         * @default PIXI.settings.CREATE_IMAGE_BITMAP
         */
        this.createBitmap = (options.createBitmap !== undefined
            ? options.createBitmap : settings.CREATE_IMAGE_BITMAP) && !!window.createImageBitmap;

        /**
         * Controls texture premultiplyAlpha field
         * Copies from options
         * @member {boolean|null}
         * @readonly
         */
        this.premultiplyAlpha = options.premultiplyAlpha !== false;

        /**
         * The ImageBitmap element created for HTMLImageElement
         * @member {ImageBitmap}
         * @default null
         */
        this.bitmap = null;

        /**
         * Promise when loading
         * @member {Promise<void>}
         * @private
         * @default null
         */
        this._load = null;

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    /**
     * returns a promise when image will be loaded and processed
     *
     * @param {boolean} [createBitmap=true] whether process image into bitmap
     * @returns {Promise<void>}
     */
    load(createBitmap)
    {
        if (createBitmap !== undefined)
        {
            this.createBitmap = createBitmap;
        }

        if (this._load)
        {
            return this._load;
        }

        this._load = new Promise((resolve) =>
        {
            this.url = this.source.src;
            const { source } = this;

            const completed = () =>
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
            }
        });

        return this._load;
    }

    /**
     * Called when we need to convert image into BitmapImage.
     * Can be called multiple times, real promise is cached inside.
     *
     * @returns {Promise<void>} cached promise to fill that bitmap
     */
    process()
    {
        if (this._process !== null)
        {
            return this._process;
        }
        if (this.bitmap !== null || !window.createImageBitmap)
        {
            return Promise.resolve(this);
        }

        this._process = window.createImageBitmap(this.source,
            0, 0, this.source.width, this.source.height,
            {
                premultiplyAlpha: this.premultiplyAlpha ? 'premultiply' : 'none',
            })
            .then((bitmap) =>
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
     * @param {PIXI.Renderer} renderer - Renderer to upload to
     * @param {PIXI.BaseTexture} baseTexture - BaseTexture for this resource
     * @param {PIXI.GLTexture} glTexture - GLTexture to use
     * @returns {boolean} true is success
     */
    upload(renderer, baseTexture, glTexture)
    {
        baseTexture.premultiplyAlpha = this.premultiplyAlpha;

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

            for (const key in baseTexture._glTextures)
            {
                const otherTex = baseTexture._glTextures[key];

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

    /**
     * Destroys this texture
     * @override
     */
    dispose()
    {
        super.dispose();

        if (this.bitmap)
        {
            this.bitmap.close();
            this.bitmap = null;
        }
        this._process = null;
        this._load = null;
    }
}
