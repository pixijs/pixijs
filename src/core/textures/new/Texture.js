import {
    uid, getUrlFileExtension, decomposeDataUri, getSvgSize,
    getResolutionOfUrl, BaseTextureCache, TextureCache,
} from '../../utils';

import ImageResource from '../resources/ImageResource';
import BufferResource from '../resources/BufferResource';
import settings from '../../settings';
import EventEmitter from 'eventemitter3';

export default class Texture extends EventEmitter
{
    constructor(width, height, format, type, resolution)
    {

		super();


		this.uid = uid();

		this.touched = 0;

		/**
		 * The width of texture
		 *
		 * @member {Number}
		 */
		this.width = width || -1;
		/**
		 * The height of texture
		 *
		 * @member {Number}
		 */
		this.height = height || -1;

		/**
         * The resolution / device pixel ratio of the texture
         *
         * @member {number}
         * @default 1
         */
        this.resolution = resolution || settings.RESOLUTION;

        /**
         * Whether or not the texture is a power of two, try to use power of two textures as much
         * as you can
         *
         * @private
         * @member {boolean}
         */
        this.isPowerOfTwo = false;

    	/**
		 * If mipmapping was used for this texture, enable and disable with enableMipmap()
		 *
		 * @member {Boolean}
		 */
        this.mipmap = false;//settings.MIPMAP_TEXTURES;

		/**
		 * Set to true to enable pre-multiplied alpha
		 *
		 * @member {Boolean}
		 */
		this.premultiplyAlpha = true;

		/**
		 * [wrapMode description]
		 * @type {[type]}
		 */
		this.wrapMode = settings.WRAP_MODE;

		/**
         * The scale mode to apply when scaling this texture
         *
         * @member {number}
         * @default PIXI.settings.SCALE_MODE
         * @see PIXI.SCALE_MODES
         */
		this.scaleMode = settings.SCALE_MODE;

		/**
		 * The pixel format of the texture. defaults to gl.RGBA
		 *
		 * @member {Number}
		 */
		this.format = format || 6408//gl.RGBA;
		this.type = type || 5121; //UNSIGNED_BYTE

		this.target = 3553; // gl.TEXTURE_2D

		this.glTextures = {};

		this._new = true;

		this.resource = null;



		this.dirtyId = 0;

        this.valid = false;

		this.validate();
    }

    get realWidth()
    {
    	return this.width / this.resolution;
    }

    get realHeight()
    {
    	return this.height / this.resolution;
    }

    setResource(resource)
    {
    	this.resource = resource;

    	this.resource.load.then((resource) => {

    		if(this.resource === resource)
    		{
    			if(resource.width !== -1 && resource.hight !== -1)
    			{
    				this.width = resource.width;
    				this.height = resource.height;
    			}

    			this.validate();

    			if(this.valid)
    			{
    				// we have not swapped half way!
    				this.dirtyId++;
    			}
    		}

    	})
    }

    resize(width, height)
    {
    	this.width = width;
    	this.height = height;

    	this.dirtyId++;
    }

    validate()
    {
    	let valid = true;

    	if(this.width === -1 || this.height === -1)
    	{
    		valid = false;
    	}

    	this.valid = valid;
    }

    /**
     * Helper function that creates a base texture from the given image url.
     * If the image is not in the base texture cache it will be created and loaded.
     *
     * @static
     * @param {string} imageUrl - The image url of the texture
     * @param {boolean} [crossorigin=(auto)] - Should use anonymous CORS? Defaults to true if the URL is not a data-URI.
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.BaseTexture} The new base texture.
     */
    static fromImage(imageUrl, crossorigin, scaleMode)
    {
        let baseTexture = BaseTextureCache[imageUrl];

        if (!baseTexture)
        {
            // new Image() breaks tex loading in some versions of Chrome.
            // See https://code.google.com/p/chromium/issues/detail?id=238071
            const resource = ImageResource.from(imageUrl, crossorigin);// document.createElement('img');

            baseTexture = new Texture();//image, scaleMode);

            baseTexture.scaleMode = scaleMode ||  baseTexture.scaleMode;
            baseTexture.resolution = getResolutionOfUrl(imageUrl);
            baseTexture.setResource(new ImageResource(image));

            image.src = imageUrl; // Setting this triggers load

            BaseTextureCache[imageUrl] = baseTexture;
        }

        return baseTexture;
    }

    /**
     * Helper function that creates a base texture from the given canvas element.
     *
     * @static
     * @param {HTMLCanvasElement} canvas - The canvas element source of the texture
     * @param {number} scaleMode - See {@link PIXI.SCALE_MODES} for possible values
     * @return {PIXI.BaseTexture} The new base texture.
     */
    static fromCanvas(canvas, scaleMode)
    {

        if (!canvas._pixiId)
        {
            canvas._pixiId = `canvas_${uid()}`;
        }

        let baseTexture = BaseTextureCache[canvas._pixiId];

        if (!baseTexture)
        {
            baseTexture = new BaseTexture(canvas, scaleMode);
            BaseTextureCache[canvas._pixiId] = baseTexture;
        }

        return baseTexture;
    }

    /**
     * Helper function that creates a base texture based on the source you provide.
     * The source can be - image url, image element, canvas element.
     *
     * @static
     * @param {string|HTMLImageElement|HTMLCanvasElement} source - The source to create base texture from.
     * @param {number} [scaleMode=PIXI.settings.SCALE_MODE] - See {@link PIXI.SCALE_MODES} for possible values
     * @param {number} [sourceScale=(auto)] - Scale for the original image, used with Svg images.
     * @return {PIXI.BaseTexture} The new base texture.
     */
    static from(source, scaleMode, sourceScale)
    {
        if (typeof source === 'string')
        {
            return BaseTexture.fromImage(source, undefined, scaleMode, sourceScale);
        }
        else if (source instanceof HTMLImageElement)
        {
            const imageUrl = source.src;
            let baseTexture = BaseTextureCache[imageUrl];

            if (!baseTexture)
            {
                baseTexture = new BaseTexture(source, scaleMode);
                baseTexture.imageUrl = imageUrl;

                if (sourceScale)
                {
                    baseTexture.sourceScale = sourceScale;
                }

                // if there is an @2x at the end of the url we are going to assume its a highres image
                baseTexture.resolution = getResolutionOfUrl(imageUrl);

                BaseTextureCache[imageUrl] = baseTexture;
            }

            return baseTexture;
        }
        else if (source instanceof HTMLCanvasElement)
        {
            return BaseTexture.fromCanvas(source, scaleMode);
        }

        // lets assume its a base texture!
        return source;
    }

    static fromFloat32Array(width, height, float32Array)
    {
    	var texture = new Texture(width, height, 6408, 5126);

    	float32Array = float32Array || new Float32Array(width*height*4);

    	texture.setResource(new BufferResource(float32Array));

    	return texture;
    }

    static fromUint8Array(width, height, uint8Array)
    {
    	var texture = new Texture(width, height, 6408, 5121);

    	uint8Array = uint8Array || new Uint8Array(width*height*4);

    	texture.setResource(new BufferResource(uint8Array));

    	return texture;
    }

}