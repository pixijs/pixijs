import { FORMATS, TYPES } from '@pixi/constants';

/**
 * Internal texture for WebGL context.
 *
 * @memberof PIXI
 */
export class GLTexture
{
    /** The WebGL texture. */
    public texture: WebGLTexture;

    /** Width of texture that was used in texImage2D. */
    public width: number;

    /** Height of texture that was used in texImage2D. */
    public height: number;

    /** Whether mip levels has to be generated. */
    public mipmap: boolean;

    /** WrapMode copied from baseTexture. */
    public wrapMode: number;

    /** Type copied from baseTexture. */
    public type: number;

    /** Type copied from baseTexture. */
    public internalFormat: number;

    /** Type of sampler corresponding to this texture. See {@link PIXI.SAMPLER_TYPES} */
    public samplerType: number;

    /** Texture contents dirty flag. */
    dirtyId: number;

    /** Texture style dirty flag. */
    dirtyStyleId: number;

    constructor(texture: WebGLTexture)
    {
        this.texture = texture;
        this.width = -1;
        this.height = -1;
        this.dirtyId = -1;
        this.dirtyStyleId = -1;
        this.mipmap = false;
        this.wrapMode = 33071;
        this.type = TYPES.UNSIGNED_BYTE;
        this.internalFormat = FORMATS.RGBA;

        this.samplerType = 0;
    }
}
