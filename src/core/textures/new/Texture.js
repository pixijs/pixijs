import TextureStyle from './TextureStyle';
import ImageResource from './resources/ImageResource';
import settings from '../../settings';


export default class Texture
{
    constructor(width, height, format)
    {
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
		this.premultiplyAlpha = false;

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
		this.type = 5121;

		this.target = 3553; // gl.TEXTURE_2D

		this.data = null;

		this.glTextures = {};

		this._new = true;

		this.resource = null;



		this.dirtyId = 0;

        this.valid = false;

		this.validate();
    }

    setResource(resource)
    {
    	this.resource = resource;

    	this.resource.load.then((resource) => {

    		if(this.resource === resource)
    		{
    			this.width = resource.width;
    			this.height = resource.height;

    			this.validate();

    			if(this.valid)
    			{
    				// we have not swapped half way!
    				this.dirtyId++;
    			}
    		}

    	})
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

    static from(url)
    {
    	var texture = new Texture();

    	var image = new Image();
    	image.src = url;
    	texture.setResource(new ImageResource(image));

    	return texture;
    }
}