import { GL_FORMATS, GL_TARGETS, GL_TYPES } from './const';

const typeSymbol = Symbol.for('pixijs.GlTexture');

/**
 * Internal texture for WebGL context
 * @category rendering
 * @ignore
 */
export class GlTexture
{
    /**
     * Type symbol used to identify instances of GlTexture.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a GlTexture.
     * @param obj - The object to check.
     * @returns True if the object is a GlTexture, false otherwise.
     */
    public static isGlTexture(obj: any): obj is GlTexture
    {
        return !!obj && !!obj[typeSymbol];
    }

    public target: GL_TARGETS = GL_TARGETS.TEXTURE_2D;

    /** The WebGL texture. */
    public texture: WebGLTexture;

    /** Width of texture that was used in texImage2D. */
    public width: number;

    /** Height of texture that was used in texImage2D. */
    public height: number;

    /** Whether mip levels has to be generated. */
    public mipmap: boolean;

    /** Type copied from texture source. */
    public type: number;

    /** Type copied from texture source. */
    public internalFormat: number;

    /** Type of sampler corresponding to this texture. See {@link SAMPLER_TYPES} */
    public samplerType: number;

    public format: GL_FORMATS;

    constructor(texture: WebGLTexture)
    {
        this.texture = texture;
        this.width = -1;
        this.height = -1;
        this.type = GL_TYPES.UNSIGNED_BYTE;
        this.internalFormat = GL_FORMATS.RGBA;
        this.format = GL_FORMATS.RGBA;
        this.samplerType = 0;
    }
}
