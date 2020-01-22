/**
 * Internal texture for WebGL context
 * @class
 * @memberof PIXI
 */
export class GLTexture
{
    texture: WebGLTexture;
    width: number;
    height: number;
    dirtyId: number;
    dirtyStyleId: number;
    mipmap: boolean;
    wrapMode: number;
    type: number;
    internalFormat: number;

    constructor(texture: WebGLTexture)
    {
        /**
         * The WebGL texture
         * @member {WebGLTexture}
         */
        this.texture = texture;

        /**
         * Width of texture that was used in texImage2D
         * @member {number}
         */
        this.width = -1;

        /**
         * Height of texture that was used in texImage2D
         * @member {number}
         */
        this.height = -1;

        /**
         * Texture contents dirty flag
         * @member {number}
         */
        this.dirtyId = -1;

        /**
         * Texture style dirty flag
         * @member {number}
         */
        this.dirtyStyleId = -1;

        /**
         * Whether mip levels has to be generated
         * @member {boolean}
         */
        this.mipmap = false;

        /**
         * WrapMode copied from baseTexture
         * @member {number}
         */
        this.wrapMode = 33071;

        /**
         * Type copied from baseTexture
         * @member {number}
         */
        this.type = 6408;

        /**
         * Type copied from baseTexture
         * @member {number}
         */
        this.internalFormat = 5121;
    }
}
