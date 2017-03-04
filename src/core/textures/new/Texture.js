import TextureStyle from './TextureStyle';

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
		this.isCube = false;
		this._new = true;
    }
}