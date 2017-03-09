import TextureStyle from './TextureStyle';
import ImageResource from './resources/ImageResource';

export default class Texture
{
    constructor(width, height, format)
    {

    	this.style = new TextureStyle();


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
		 * The pixel format of the texture. defaults to gl.RGBA
		 *
		 * @member {Number}
		 */
		this.format = format;//format || gl.RGBA;

		this.data = null;

		this.glTextures = {};

		this._new = true;

		this.resource = null;

		this.type = 3553;// gl.TEXTURE_2D

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