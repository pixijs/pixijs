import { type GPUData } from '../../../../scene/view/ViewContainer';
import { GL_FORMATS, GL_TARGETS, GL_TYPES } from './const';

/**
 * Internal texture for WebGL context
 * @category rendering
 * @ignore
 */
export class GlTexture implements GPUData
{
    public target: GL_TARGETS = GL_TARGETS.TEXTURE_2D;

    /** The WebGL texture. */
    public texture: WebGLTexture;

    /**
     * Bitmask tracking which array layers / sub-targets have been initialized at mip level 0.
     * Used by uploaders that need per-layer allocation semantics (e.g. cube faces).
     * @internal
     */
    public _layerInitMask = 0;

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

    public destroy(): void
    {
        // BOOM
    }
}
