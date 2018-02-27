export default class GLTexture
{
    constructor(texture)
    {
        /**
         * The WebGL texture
         *
         * @member {WebGLTexture}
         */
        this.texture = texture;

        this.width = -1;
        this.height = -1;

        /**
         * Texture contents dirty flag
         * @member {number}
         */
        this.dirtyId = -1;

        /**
         * Texture style dirty flag
         * @type {number}
         */
        this.dirtyStyleId = -1;

        /**
         * Whether mip levels has to be generated
         * @type {boolean}
         */
        this.mipmap = false;
    }
}
