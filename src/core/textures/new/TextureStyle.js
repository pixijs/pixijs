import settings from '../../settings';


export default class TextureStyle
{
    constructor()
    {
    	/**
		 * If mipmapping was used for this texture, enable and disable with enableMipmap()
		 *
		 * @member {Boolean}
		 */
        this.mipmap = settings.MIPMAP_TEXTURES;


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
    }
}