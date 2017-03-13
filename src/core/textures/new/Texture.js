import ImageResource from './resources/ImageResource';
import BufferResource from './resources/BufferResource';
import settings from '../../settings';


export default class Texture
{
    constructor(width, height, format, type)
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

    static from(url)
    {
    	var texture = new Texture();

    	var image = new Image();
    	image.src = url;
    	texture.setResource(new ImageResource(image));

    	return texture;
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