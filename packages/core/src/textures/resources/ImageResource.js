import { determineCrossOrigin } from '@pixi/utils';
import BaseImageResource from './BaseImageResource';
import { settings } from '@pixi/settings';

/**
 * Resource type for HTMLImageElement.
 * @class
 * @extends PIXI.resources.BaseImageResource
 * @memberof PIXI.resources
 */
export default class ImageResource extends BaseImageResource
{
    /**
     * @param {HTMLImageElement|string} source - image source or URL
     * @param {boolean} [options.autoLoad=true] start loading process
     * @param {boolean} [options.createBitmap=true] whether its required to create
     *        a bitmap before upload defaults true
     * @param {boolean} [options.crossorigin=true] - Load image using cross origin
     */
    constructor(source, options)
    {
        options = Object.assign({
            autoLoad: true,
            createBitmap: true,
            crossorigin: true,
        }, options);

        if (!(source instanceof HTMLImageElement))
        {
            const imageElement = new Image();

            if (options.crossorigin === undefined && source.indexOf('data:') !== 0)
            {
                imageElement.crossOrigin = determineCrossOrigin(source);
            }
            else if (options.crossorigin)
            {
                imageElement.crossOrigin = 'anonymous';
            }

            imageElement.src = source;
            source = imageElement;
        }

        super(source);

        /**
         * URL of the image source
         * @member {string}
         */
        this.url = source.src;

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
        this.createBitmap = options.createBitmap && settings.CREATE_IMAGE_BITMAP && !!window.createImageBitmap;

        /**
         * The ImageBitmap element created for HTMLImageElement
         * @member {ImageBitmap}
         * @default null
         */
        this.bitmap = null;

        /**
         * Promise when loading
         * @member {Promise}
         * @private
         * @default null
         */
        this._load = null;

        if (options.autoLoad)
        {
            this.validate();
        }
    }

    /**
     * returns a promise when image will be loaded and processed
     *
     * @param {boolean} [createBitmap=true] whether process image into bitmap
     * @returns {Promise}
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
            const source = this.source;

            const stuff = () =>
            {
                this.valid = true;
                source.onload = null;
                source.onerror = null;

                this.resize(source.width, source.height);

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
                stuff();
            }
            else
            {
                source.onload = stuff;
            }
        });

        return this._load;
    }

    /**
     * Called when we need to convert image into bitmap.
     * Can be called multiple times, real promise is cached inside.
     *
     * @returns {Promise} cached promise to fill that bitmap
     */
    process()
    {
        if (this._process !== null)
        {
            return this._process;
        }
        if (this.bitmap !== null)
        {
            return Promise.resolve(this.bitmap);
        }

        this._process = this.onProcess();

        return this._process;
    }

    /**
     * insides of `process`, called only once per bitmap generation
     *
     * @returns {Promise} promise to fill that bitmap
     */
    onProcess()
    {
        if (!window.createImageBitmap)
        {
            return Promise.resolve(this);
        }

        return window.createImageBitmap(this.source).then((imageBitmap) =>
        {
            this.bitmap = imageBitmap;
            this.update();

            return this;
        });
    }

    /**
     * Upload the image resource to GPU.
     *
     * @param {PIXI.Renderer} renderer - Renderer to upload to
     * @param {PIXI.BaseTexture} baseTexture - BaseTexture for this resource
     * @param {PIXI.glCore.Texture} glTexture - GLTexture to use
     */
    upload(renderer, baseTexture, glTexture)
    {
        if (this.createBitmap)
        {
            if (!this.bitmap)
            {
                // yeah, ignore the output
                this.process();
                if (!this.bitmap)
                {
                    return false;
                }
            }
            glTexture.upload(this.bitmap);
            if (!this.preserveBitmap)
            {
                if (this.bitmap.close)
                {
                    this.bitmap.close();
                }
                this.bitmap = null;
                this._process = null;
            }
        }
        else
        {
            glTexture.upload(this.source);
        }

        return true;
    }
}
