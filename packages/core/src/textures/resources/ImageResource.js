import { determineCrossOrigin } from '@pixi/utils';
import BaseImageResource from './BaseImageResource';
import { settings } from '@pixi/settings';

/**
 * Resource type for HTMLImageElement.
 * @class
 * @extends PIXI.BaseImageResource
 * @memberof PIXI
 * @param {HTMLImageElement} source - Image element to use
 */
export default class ImageResource extends BaseImageResource
{
    /**
     *
     * @param source image source
     * @param loadRightNow start loading process
     * @param createBitmap whether its required to create a bitmap before upload
     */
    constructor(source, loadRightNow = true, createBitmap)
    {
        super(source);

        this.url = source.src;

        this._load = null;
        this._process = null;

        this.loaded = false;
        this.preserveBitmap = false;
        this.createBitmap = (createBitmap !== undefined) ? createBitmap
            : (settings.CREATE_IMAGE_BITMAP && !!window.createImageBitmap);
        this.bitmap = null;

        if (loadRightNow)
        {
            this.load();
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
                this.loaded = true;
                source.onload = null;
                source.onerror = null;

                if (this.baseTexture)
                {
                    this._validate();
                }

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
            this.baseTexture.update();

            return this;
        });
    }

    onTextureUpload(renderer, baseTexture, glTexture)
    {
        if (this.createBitmap)
        {
            if (!this.bitmap)
            {
                // yeah, i ignore the output.
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

    static from(url, crossorigin)
    {
        const image = new Image();

        if (crossorigin === undefined && url.indexOf('data:') !== 0)
        {
            image.crossOrigin = determineCrossOrigin(url);
        }
        else if (crossorigin)
        {
            image.crossOrigin = 'anonymous';
        }

        image.src = url;

        return new ImageResource(image);
    }
}
