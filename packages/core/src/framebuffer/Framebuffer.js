import { Runner } from '@pixi/runner';
import { BaseTexture } from '../textures/BaseTexture';
import { DepthResource } from '../textures/resources/DepthResource';
import { Renderbuffer } from '../renderbuffer/Renderbuffer';
import { FORMATS, TYPES } from '@pixi/constants';

/**
 * Frame buffer used by the BaseRenderTexture
 *
 * @class
 * @memberof PIXI
 */
export class Framebuffer
{
    /**
     * @param {number} width - Width of the frame buffer
     * @param {number} height - Height of the frame buffer
     */
    constructor(width, height)
    {
        this.width = Math.ceil(width || 100);
        this.height = Math.ceil(height || 100);

        this.stencil = false;
        this.depth = false;

        this.dirtyId = 0;
        this.dirtyFormat = 0;
        this.dirtySize = 0;

        this.depthTexture = null;

        /**
         * Map of color attachments to the color buffers for this framebuffer.
         *
         * @member Array<BaseTexture | Renderbuffer>
         */
        this.colorBuffers = [];

        this.glFramebuffers = {};

        this.disposeRunner = new Runner('disposeFramebuffer', 2);
    }

    /**
     * Reference to the (first) color texture.
     *
     * @member {PIXI.BaseTexture}
     * @readonly
     */
    get colorTexture()
    {
        return this.colorTextures[0];
    }

    get colorTextures()
    {
        return this.colorBuffers;
    }

    /**
     * Reference to the (first) color renderbuffer.
     *
     * @member {PIXI.Renderbuffer}
     * @readonly
     */
    get colorRenderBuffer()
    {
        return this.colorBuffers[0];
    }

    /**
     * Adds a texture to the color buffers.
     *
     * @param {number} [index=0] - color attachment for the texture
     * @param {PIXI.BaseTexture} [texture] - texture to attach
     */
    addColorTexture(index = 0, texture)
    {
        if (texture.realWidth !== this.width && texture.realHeight !== this.height)
        {
            throw new Error('Cannot attach texture with different dimensions to framebuffer.');
        }
        if (this.colorBuffers.length <= index)
        {
            this.colorBuffers.length = index + 1;
        }

        this.colorBuffers[index] = texture || new BaseTexture(null, { scaleMode: 0,
            resolution: 1,
            mipmap: false,
            width: this.width,
            height: this.height });

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Adds a renderbuffer to the color buffers.
     *
     * @param {number} [index=0] - color attachment for the renderbuffer
     * @param {PIXI.Renderbuffer} [renderbuffer] - renderbuffer to attach
     * @returns {PIXI.Framebuffer} - `this`
     */
    addColorRenderbuffer(index = 0, renderbuffer)
    {
        if (renderbuffer.width !== this.width && renderbuffer.height !== this.height)
        {
            throw new Error('Cannot attach renderbuffer with different dimensions to framebuffer');
        }
        if (this.colorBuffers.length <= index)
        {
            this.colorBuffers.length = index + 1;
        }

        this.colorBuffers[index] = renderbuffer || new Renderbuffer(
            this.width,
            this.height);

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Adds a color buffer to the color attachments, determining whether it is a
     * texture or a renderbuffer.
     *
     * @param {number} [index=0] - color attachmenet for the buffer
     * @param {PIXI.BaseTexture | PIXI.Renderbuffer} buffer
     * @returns {PIXI.Framebuffer} - `this`
     */
    addColorBuffer(index = 0, buffer)
    {
        if (buffer instanceof BaseTexture)
        {
            return this.addColorTexture(index, buffer);
        }
        else if (buffer instanceof Renderbuffer)
        {
            return this.addColorRenderbuffer(index, buffer);
        }

        throw new Error('Unknown color buffer type: must be BaseTexture or Renderbuffer');
    }

    /**
     * Add a depth texture to the frame buffer
     *
     * @param {PIXI.Texture} [texture] - Texture to add
     */
    addDepthTexture(texture)
    {
        /* eslint-disable max-len */
        this.depthTexture = texture || new BaseTexture(new DepthResource(null, { width: this.width, height: this.height }), { scaleMode: 0,
            resolution: 1,
            width: this.width,
            height: this.height,
            mipmap: false,
            format: FORMATS.DEPTH_COMPONENT,
            type: TYPES.UNSIGNED_SHORT });
        /* eslint-disable max-len */
        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Enable depth on the frame buffer
     */
    enableDepth()
    {
        this.depth = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Enable stencil on the frame buffer
     */
    enableStencil()
    {
        this.stencil = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Resize the frame buffer
     *
     * @param {number} width - Width of the frame buffer to resize to
     * @param {number} height - Height of the frame buffer to resize to
     */
    resize(width, height)
    {
        width = Math.ceil(width);
        height = Math.ceil(height);

        if (width === this.width && height === this.height) return;

        this.width = width;
        this.height = height;

        this.dirtyId++;
        this.dirtySize++;

        for (let i = 0; i < this.colorTextures.length; i++)
        {
            const texture = this.colorTextures[i];
            const resolution = texture.resolution;

            // take into acount the fact the texture may have a different resolution..
            texture.setSize(width / resolution, height / resolution);
        }

        if (this.depthTexture)
        {
            const resolution = this.depthTexture.resolution;

            this.depthTexture.setSize(width / resolution, height / resolution);
        }
    }

    /**
     * disposes WebGL resources that are connected to this geometry
     */
    dispose()
    {
        this.disposeRunner.run(this, false);
    }
}

/**
 * @namespace PIXI
 * @typedef {PIXI.BaseTexture | PIXI.Renderbuffer} ColorBuffer
 */
