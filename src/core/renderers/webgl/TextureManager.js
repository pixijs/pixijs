import { GLTexture } from 'pixi-gl-core';
import { WRAP_MODES, SCALE_MODES } from '../../const';
import RenderTarget from './utils/RenderTarget';
import { removeItems } from '../../utils';

/**
 * Helper class to create a webGL Texture
 *
 * @class
 * @memberof PIXI
 */
export default class TextureManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - A reference to the current renderer
     */
    constructor(renderer)
    {
        /**
         * A reference to the current renderer
         *
         * @member {PIXI.WebGLRenderer}
         */
        this.renderer = renderer;

        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = renderer.gl;

        /**
         * Track textures in the renderer so we can no longer listen to them on destruction.
         *
         * @member {Array<*>}
         * @private
         */
        this._managedTextures = [];
    }

    /**
     * Binds a texture.
     *
     */
    bindTexture()
    {
        // empty
    }

    /**
     * Gets a texture.
     *
     */
    getTexture()
    {
        // empty
    }

    /**
     * Updates and/or Creates a WebGL texture for the renderer's context.
     *
     * @param {PIXI.BaseTexture|PIXI.Texture} texture - the texture to update
     * @param {number} location - the location the texture will be bound to.
     * @return {GLTexture} The gl texture.
     */
    updateTexture(texture, location)
    {
        // assume it good!
        // texture = texture.baseTexture || texture;

        const gl = this.gl;

        const isRenderTexture = !!texture._glRenderTargets;

        if (!texture.hasLoaded)
        {
            return null;
        }

        const boundTextures = this.renderer.boundTextures;

        // if the location is undefined then this may have been called by n event.
        // this being the case the texture may already be bound to a slot. As a texture can only be bound once
        // we need to find its current location if it exists.
        if (location === undefined)
        {
            location = 0;

            // TODO maybe we can use texture bound ids later on...
            // check if texture is already bound..
            for (let i = 0; i < boundTextures.length; ++i)
            {
                if (boundTextures[i] === texture)
                {
                    location = i;
                    break;
                }
            }
        }

        boundTextures[location] = texture;

        gl.activeTexture(gl.TEXTURE0 + location);

        let glTexture = texture._glTextures[this.renderer.CONTEXT_UID];

        if (!glTexture)
        {
            if (isRenderTexture)
            {
                const renderTarget = new RenderTarget(
                    this.gl,
                    texture.width,
                    texture.height,
                    texture.scaleMode,
                    texture.resolution
                );

                renderTarget.resize(texture.width, texture.height);
                texture._glRenderTargets[this.renderer.CONTEXT_UID] = renderTarget;
                glTexture = renderTarget.texture;
            }
            else
            {
                glTexture = new GLTexture(this.gl, null, null, null, null);
                glTexture.bind(location);
                glTexture.premultiplyAlpha = true;
                glTexture.upload(texture.source);
            }

            texture._glTextures[this.renderer.CONTEXT_UID] = glTexture;

            texture.on('update', this.updateTexture, this);
            texture.on('dispose', this.destroyTexture, this);

            this._managedTextures.push(texture);

            if (texture.isPowerOfTwo)
            {
                if (texture.mipmap)
                {
                    glTexture.enableMipmap();
                }

                if (texture.wrapMode === WRAP_MODES.CLAMP)
                {
                    glTexture.enableWrapClamp();
                }
                else if (texture.wrapMode === WRAP_MODES.REPEAT)
                {
                    glTexture.enableWrapRepeat();
                }
                else
                {
                    glTexture.enableWrapMirrorRepeat();
                }
            }
            else
            {
                glTexture.enableWrapClamp();
            }

            if (texture.scaleMode === SCALE_MODES.NEAREST)
            {
                glTexture.enableNearestScaling();
            }
            else
            {
                glTexture.enableLinearScaling();
            }
        }
        // the texture already exists so we only need to update it..
        else if (isRenderTexture)
        {
            texture._glRenderTargets[this.renderer.CONTEXT_UID].resize(texture.width, texture.height);
        }
        else
        {
            glTexture.upload(texture.source);
        }

        return glTexture;
    }

    /**
     * Deletes the texture from WebGL
     *
     * @param {PIXI.BaseTexture|PIXI.Texture} texture - the texture to destroy
     * @param {boolean} [skipRemove=false] - Whether to skip removing the texture from the TextureManager.
     */
    destroyTexture(texture, skipRemove)
    {
        texture = texture.baseTexture || texture;

        if (!texture.hasLoaded)
        {
            return;
        }

        if (texture._glTextures[this.renderer.CONTEXT_UID])
        {
            this.renderer.unbindTexture(texture);

            texture._glTextures[this.renderer.CONTEXT_UID].destroy();
            texture.off('update', this.updateTexture, this);
            texture.off('dispose', this.destroyTexture, this);

            delete texture._glTextures[this.renderer.CONTEXT_UID];

            if (!skipRemove)
            {
                const i = this._managedTextures.indexOf(texture);

                if (i !== -1)
                {
                    removeItems(this._managedTextures, i, 1);
                }
            }
        }
    }

    /**
     * Deletes all the textures from WebGL
     */
    removeAll()
    {
        // empty all the old gl textures as they are useless now
        for (let i = 0; i < this._managedTextures.length; ++i)
        {
            const texture = this._managedTextures[i];

            if (texture._glTextures[this.renderer.CONTEXT_UID])
            {
                delete texture._glTextures[this.renderer.CONTEXT_UID];
            }
        }
    }

    /**
     * Destroys this manager and removes all its textures
     */
    destroy()
    {
        // destroy managed textures
        for (let i = 0; i < this._managedTextures.length; ++i)
        {
            const texture = this._managedTextures[i];

            this.destroyTexture(texture, true);

            texture.off('update', this.updateTexture, this);
            texture.off('dispose', this.destroyTexture, this);
        }

        this._managedTextures = null;
    }
}
