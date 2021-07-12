import { BaseTexture } from './BaseTexture';
import { GLTexture } from './GLTexture';
import { removeItems } from '@pixi/utils';
import { FORMATS, MIPMAP_MODES, WRAP_MODES, SCALE_MODES, TYPES, SAMPLER_TYPES } from '@pixi/constants';

import type { ISystem } from '../ISystem';
import type { Texture } from './Texture';
import type { IRenderingContext } from '../IRenderingContext';
import type { Renderer } from '../Renderer';

const glTypeFormatLookup: { [type: number]: { [format: number]: number } } = ('WebGL2RenderingContext' in self ? {
    [TYPES.UNSIGNED_BYTE]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGBA8,
        [FORMATS.RGB]: WebGL2RenderingContext.RGB8,
        [FORMATS.RG]: WebGL2RenderingContext.RG8,
        [FORMATS.RED]: WebGL2RenderingContext.R8,
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGBA8UI,
        [FORMATS.RGB_INTEGER]: WebGL2RenderingContext.RGB8UI,
        [FORMATS.RG_INTEGER]: WebGL2RenderingContext.RG8UI,
        [FORMATS.RED_INTEGER]: WebGL2RenderingContext.R8UI,
        [FORMATS.ALPHA]: WebGL2RenderingContext.ALPHA,
        [FORMATS.LUMINANCE]: WebGL2RenderingContext.LUMINANCE,
        [FORMATS.LUMINANCE_ALPHA]: WebGL2RenderingContext.LUMINANCE_ALPHA,
    },
    [TYPES.BYTE]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGBA8_SNORM,
        [FORMATS.RGB]: WebGL2RenderingContext.RGB8_SNORM,
        [FORMATS.RG]: WebGL2RenderingContext.RG8_SNORM,
        [FORMATS.RED]: WebGL2RenderingContext.R8_SNORM,
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGBA8I,
        [FORMATS.RGB_INTEGER]: WebGL2RenderingContext.RGB8I,
        [FORMATS.RG_INTEGER]: WebGL2RenderingContext.RG8I,
        [FORMATS.RED_INTEGER]: WebGL2RenderingContext.R8I,
    },
    [TYPES.UNSIGNED_SHORT]: {
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGBA16UI,
        [FORMATS.RGB_INTEGER]: WebGL2RenderingContext.RGB16UI,
        [FORMATS.RG_INTEGER]: WebGL2RenderingContext.RG16UI,
        [FORMATS.RED_INTEGER]: WebGL2RenderingContext.R16UI,
        [FORMATS.DEPTH_COMPONENT]: WebGL2RenderingContext.DEPTH_COMPONENT16,
    },
    [TYPES.SHORT]: {
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGBA16I,
        [FORMATS.RGB_INTEGER]: WebGL2RenderingContext.RGB16I,
        [FORMATS.RG_INTEGER]: WebGL2RenderingContext.RG16I,
        [FORMATS.RED_INTEGER]: WebGL2RenderingContext.R16I,
    },
    [TYPES.UNSIGNED_INT]: {
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGBA32UI,
        [FORMATS.RGB_INTEGER]: WebGL2RenderingContext.RGB32UI,
        [FORMATS.RG_INTEGER]: WebGL2RenderingContext.RG32UI,
        [FORMATS.RED_INTEGER]: WebGL2RenderingContext.R32UI,
        [FORMATS.DEPTH_COMPONENT]: WebGL2RenderingContext.DEPTH_COMPONENT24,
    },
    [TYPES.INT]: {
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGBA32I,
        [FORMATS.RGB_INTEGER]: WebGL2RenderingContext.RGB32I,
        [FORMATS.RG_INTEGER]: WebGL2RenderingContext.RG32I,
        [FORMATS.RED_INTEGER]: WebGL2RenderingContext.R32I,
    },
    [TYPES.FLOAT]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGBA32F,
        [FORMATS.RGB]: WebGL2RenderingContext.RGB32F,
        [FORMATS.RG]: WebGL2RenderingContext.RG32F,
        [FORMATS.RED]: WebGL2RenderingContext.R32F,
        [FORMATS.DEPTH_COMPONENT]: WebGL2RenderingContext.DEPTH_COMPONENT32F,
    },
    [TYPES.HALF_FLOAT]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGBA16F,
        [FORMATS.RGB]: WebGL2RenderingContext.RGB16F,
        [FORMATS.RG]: WebGL2RenderingContext.RG16F,
        [FORMATS.RED]: WebGL2RenderingContext.R16F,
    },
    [TYPES.UNSIGNED_SHORT_5_6_5]: {
        [FORMATS.RGB]: WebGL2RenderingContext.RGB565,
    },
    [TYPES.UNSIGNED_SHORT_4_4_4_4]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGBA4,
    },
    [TYPES.UNSIGNED_SHORT_5_5_5_1]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGB5_A1,
    },
    [TYPES.UNSIGNED_INT_2_10_10_10_REV]: {
        [FORMATS.RGBA]: WebGL2RenderingContext.RGB10_A2,
        [FORMATS.RGBA_INTEGER]: WebGL2RenderingContext.RGB10_A2UI,
    },
    [TYPES.UNSIGNED_INT_10F_11F_11F_REV]: {
        [FORMATS.RGB]: WebGL2RenderingContext.R11F_G11F_B10F,
    },
    [TYPES.UNSIGNED_INT_5_9_9_9_REV]: {
        [FORMATS.RGB]: WebGL2RenderingContext.RGB9_E5,
    },
    [TYPES.UNSIGNED_INT_24_8]: {
        [FORMATS.DEPTH_STENCIL]: WebGL2RenderingContext.DEPTH24_STENCIL8,
    },
    [TYPES.FLOAT_32_UNSIGNED_INT_24_8_REV]: {
        [FORMATS.DEPTH_STENCIL]: WebGL2RenderingContext.DEPTH32F_STENCIL8,
    },
} : undefined);

/**
 * System plugin to the renderer to manage textures.
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI
 */

export class TextureSystem implements ISystem
{
    public boundTextures: BaseTexture[];
    public managedTextures: Array<BaseTexture>;
    /** Whether glTexture with int/uint sampler type was uploaded. */
    protected hasIntegerTextures: boolean;
    protected CONTEXT_UID: number;
    protected gl: IRenderingContext;
    protected webGLVersion: number;
    protected unknownTexture: BaseTexture;
    protected _unknownBoundTextures: boolean;
    currentLocation: number;
    emptyTextures: {[key: number]: GLTexture};
    private renderer: Renderer;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        // TODO set to max textures...
        /**
         * Bound textures
         * @member {PIXI.BaseTexture[]}
         * @readonly
         */
        this.boundTextures = [];

        /**
         * Current location
         * @member {number}
         * @readonly
         */
        this.currentLocation = -1;

        /**
         * List of managed textures
         * @member {PIXI.BaseTexture[]}
         * @readonly
         */
        this.managedTextures = [];

        /**
         * Did someone temper with textures state? We'll overwrite them when we need to unbind something.
         * @member {boolean}
         * @private
         */
        this._unknownBoundTextures = false;

        /**
         * BaseTexture value that shows that we don't know what is bound
         * @member {PIXI.BaseTexture}
         * @readonly
         */
        this.unknownTexture = new BaseTexture();

        this.hasIntegerTextures = false;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     */
    contextChange(): void
    {
        const gl = this.gl = this.renderer.gl;

        this.CONTEXT_UID = this.renderer.CONTEXT_UID;

        this.webGLVersion = this.renderer.context.webGLVersion;

        const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        this.boundTextures.length = maxTextures;

        for (let i = 0; i < maxTextures; i++)
        {
            this.boundTextures[i] = null;
        }

        // TODO move this.. to a nice make empty textures class..
        this.emptyTextures = {};

        const emptyTexture2D = new GLTexture(gl.createTexture());

        gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

        this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D;
        this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(gl.createTexture());

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);

        for (let i = 0; i < 6; i++)
        {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        for (let i = 0; i < this.boundTextures.length; i++)
        {
            this.bind(null, i);
        }
    }

    /**
     * Bind a texture to a specific location
     *
     * If you want to unbind something, please use `unbind(texture)` instead of `bind(null, textureLocation)`
     *
     * @param {PIXI.Texture|PIXI.BaseTexture} texture_ - Texture to bind
     * @param {number} [location=0] - Location to bind at
     */
    bind(texture: Texture|BaseTexture, location = 0): void
    {
        const { gl } = this;

        if (texture)
        {
            texture = texture.castToBaseTexture();

            if (texture.parentTextureArray)
            {
                // cannot bind partial texture
                // TODO: report a warning
                return;
            }

            if (texture.valid)
            {
                texture.touched = this.renderer.textureGC.count;

                const glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);

                if (this.boundTextures[location] !== texture)
                {
                    if (this.currentLocation !== location)
                    {
                        this.currentLocation = location;
                        gl.activeTexture(gl.TEXTURE0 + location);
                    }

                    gl.bindTexture(texture.target, glTexture.texture);
                }

                if (glTexture.dirtyId !== texture.dirtyId)
                {
                    if (this.currentLocation !== location)
                    {
                        this.currentLocation = location;
                        gl.activeTexture(gl.TEXTURE0 + location);
                    }
                    this.updateTexture(texture);
                }

                this.boundTextures[location] = texture;
            }
        }
        else
        {
            if (this.currentLocation !== location)
            {
                this.currentLocation = location;
                gl.activeTexture(gl.TEXTURE0 + location);
            }

            gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
            this.boundTextures[location] = null;
        }
    }

    /**
     * Resets texture location and bound textures
     *
     * Actual `bind(null, i)` calls will be performed at next `unbind()` call
     */
    reset(): void
    {
        this._unknownBoundTextures = true;
        this.hasIntegerTextures = false;
        this.currentLocation = -1;

        for (let i = 0; i < this.boundTextures.length; i++)
        {
            this.boundTextures[i] = this.unknownTexture;
        }
    }

    /**
     * Unbind a texture
     * @param {PIXI.BaseTexture} texture - Texture to bind
     */
    unbind(texture?: BaseTexture): void
    {
        const { gl, boundTextures } = this;

        if (this._unknownBoundTextures)
        {
            this._unknownBoundTextures = false;
            // someone changed webGL state,
            // we have to be sure that our texture does not appear in multi-texture renderer samplers
            for (let i = 0; i < boundTextures.length; i++)
            {
                if (boundTextures[i] === this.unknownTexture)
                {
                    this.bind(null, i);
                }
            }
        }

        for (let i = 0; i < boundTextures.length; i++)
        {
            if (boundTextures[i] === texture)
            {
                if (this.currentLocation !== i)
                {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    this.currentLocation = i;
                }

                gl.bindTexture(texture.target, this.emptyTextures[texture.target].texture);
                boundTextures[i] = null;
            }
        }
    }

    /**
     * Ensures that current boundTextures all have FLOAT sampler type,
     * see {@link PIXI.SAMPLER_TYPES} for explanation.
     *
     * @param maxTextures - number of locations to check
     */
    ensureSamplerType(maxTextures: number): void
    {
        const { boundTextures, hasIntegerTextures, CONTEXT_UID } = this;

        if (!hasIntegerTextures)
        {
            return;
        }

        for (let i = maxTextures - 1; i >= 0; --i)
        {
            const tex = boundTextures[i];

            if (tex)
            {
                const glTexture = tex._glTextures[CONTEXT_UID];

                if (glTexture.samplerType !== SAMPLER_TYPES.FLOAT)
                {
                    this.renderer.texture.unbind(tex);
                }
            }
        }
    }

    /**
     * Initialize a texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to initialize
     */
    initTexture(texture: BaseTexture): GLTexture
    {
        const glTexture = new GLTexture(this.gl.createTexture());

        // guarantee an update..
        glTexture.dirtyId = -1;

        texture._glTextures[this.CONTEXT_UID] = glTexture;

        this.managedTextures.push(texture);
        texture.on('dispose', this.destroyTexture, this);

        return glTexture;
    }

    initTextureType(texture: BaseTexture, glTexture: GLTexture): void
    {
        if (this.webGLVersion !== 2)
        {
            glTexture.internalFormat = texture.format;
            glTexture.type = texture.type;
        }
        else
        {
            glTexture.internalFormat = glTypeFormatLookup[texture.type][texture.format];

            if (texture.type === TYPES.HALF_FLOAT)
            {
                // TYPES.HALF_FLOAT is WebGL1 HALF_FLOAT_OES
                // we have to convert it to WebGL HALF_FLOAT
                glTexture.type = WebGL2RenderingContext.HALF_FLOAT;
            }
            else
            {
                glTexture.type = texture.type;
            }
        }
    }

    /**
     * Update a texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to initialize
     */
    updateTexture(texture: BaseTexture): void
    {
        const glTexture = texture._glTextures[this.CONTEXT_UID];

        if (!glTexture)
        {
            return;
        }

        const renderer = this.renderer;

        this.initTextureType(texture, glTexture);

        if (texture.resource && texture.resource.upload(renderer, texture, glTexture))
        {
            // texture is uploaded, dont do anything!
            if (glTexture.samplerType !== SAMPLER_TYPES.FLOAT)
            {
                this.hasIntegerTextures = true;
            }
        }
        else
        {
            // default, renderTexture-like logic
            const width = texture.realWidth;
            const height = texture.realHeight;
            const gl = renderer.gl;

            if (glTexture.width !== width
                || glTexture.height !== height
                || glTexture.dirtyId < 0)
            {
                glTexture.width = width;
                glTexture.height = height;

                gl.texImage2D(texture.target, 0,
                    glTexture.internalFormat,
                    width,
                    height,
                    0,
                    texture.format,
                    glTexture.type,
                    null);
            }
        }

        // lets only update what changes..
        if (texture.dirtyStyleId !== glTexture.dirtyStyleId)
        {
            this.updateTextureStyle(texture);
        }
        glTexture.dirtyId = texture.dirtyId;
    }

    /**
     * Deletes the texture from WebGL
     *
     * @private
     * @param {PIXI.BaseTexture|PIXI.Texture} texture_ - the texture to destroy
     * @param {boolean} [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
     */
    destroyTexture(texture: BaseTexture|Texture, skipRemove?: boolean): void
    {
        const { gl } = this;

        texture = texture.castToBaseTexture();

        if (texture._glTextures[this.CONTEXT_UID])
        {
            this.unbind(texture);

            gl.deleteTexture(texture._glTextures[this.CONTEXT_UID].texture);
            texture.off('dispose', this.destroyTexture, this);

            delete texture._glTextures[this.CONTEXT_UID];

            if (!skipRemove)
            {
                const i = this.managedTextures.indexOf(texture);

                if (i !== -1)
                {
                    removeItems(this.managedTextures, i, 1);
                }
            }
        }
    }

    /**
     * Update texture style such as mipmap flag
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to update
     */
    updateTextureStyle(texture: BaseTexture): void
    {
        const glTexture = texture._glTextures[this.CONTEXT_UID];

        if (!glTexture)
        {
            return;
        }

        if ((texture.mipmap === MIPMAP_MODES.POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo)
        {
            glTexture.mipmap = false;
        }
        else
        {
            glTexture.mipmap = texture.mipmap >= 1;
        }

        if (this.webGLVersion !== 2 && !texture.isPowerOfTwo)
        {
            glTexture.wrapMode = WRAP_MODES.CLAMP;
        }
        else
        {
            glTexture.wrapMode = texture.wrapMode;
        }

        if (texture.resource && texture.resource.style(this.renderer, texture, glTexture))
        {
            // style is set, dont do anything!
        }
        else
        {
            this.setStyle(texture, glTexture);
        }

        glTexture.dirtyStyleId = texture.dirtyStyleId;
    }

    /**
     * Set style for texture
     *
     * @private
     * @param {PIXI.BaseTexture} texture - Texture to update
     * @param {PIXI.GLTexture} glTexture
     */
    setStyle(texture: BaseTexture, glTexture: GLTexture): void
    {
        const gl = this.gl;

        if (glTexture.mipmap && texture.mipmap !== MIPMAP_MODES.ON_MANUAL)
        {
            gl.generateMipmap(texture.target);
        }

        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
        gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode);

        if (glTexture.mipmap)
        {
            /* eslint-disable max-len */
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
            /* eslint-disable max-len */

            const anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;

            if (anisotropicExt && texture.anisotropicLevel > 0 && texture.scaleMode === SCALE_MODES.LINEAR)
            {
                const level = Math.min(texture.anisotropicLevel, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));

                gl.texParameterf(texture.target, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
            }
        }
        else
        {
            gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
        }

        gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode === SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    }

    /**
     * @ignore
     */
    destroy(): void
    {
        this.renderer = null;
    }
}
