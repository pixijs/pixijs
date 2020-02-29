import { Runner } from '@pixi/runner';
import { BaseTexture } from '../textures/BaseTexture';
import { DepthResource } from '../textures/resources/DepthResource';
import { FORMATS, MIPMAP_MODES, TYPES, MSAA_QUALITY } from '@pixi/constants';

import { GLFramebuffer } from './GLFramebuffer';

/**
 * A framebuffer can be used as the destination for rendering. It is a low-level construct
 * that is used by `PIXI.BaseRenderTexture`.
 *
 * <pre><code>PIXI.Framebuffer</code></pre> supports the following features:
 * 1. Multiple render targets that are textures.
 * 2. Color attachment 0 can be antialiased (by using an intermediate renderbuffer).
 * 3. Depth testing.
 * 4. Stencil testing.
 *
 * NOTE:
 * Multisampled antialiasing is an experimental feature. Although it is faster than rendering
 * at higher resolutions, it still has performance & memory consumption effects.
 *
 * @class
 * @memberof PIXI
 */
export class Framebuffer
{
    public width: number;
    public height: number;
    public multisample: MSAA_QUALITY;
    stencil: boolean;
    depth: boolean;
    dirtyId: number;
    dirtyFormat: number;
    dirtySize: number;
    depthTexture: BaseTexture;
    colorTextures: Array<BaseTexture>;
    glFramebuffers: {[key: string]: GLFramebuffer};
    disposeRunner: Runner;

    /**
     * @param {number} width - Width of the frame buffer
     * @param {number} height - Height of the frame buffer
     */
    constructor(width: number, height: number)
    {
        /**
         * Width of framebuffer in pixels
         *
         * @member {number}
         * @default {100}
         */
        this.width = Math.ceil(width || 100);

        /**
         * Height of framebuffer in pixels
         *
         * @member {number}
         * @default {100}
         */
        this.height = Math.ceil(height || 100);

        /**
         * Whether to use a stencil buffer.
         *
         * @private
         * @member {boolean}
         */
        this.stencil = false;

        /**
         * Whether to use a depth buffer.
         *
         * @private
         * @member {boolean}
         * @see {PIXI.Framebuffer#depthTexture}
         */
        this.depth = false;

        this.dirtyId = 0;
        this.dirtyFormat = 0;
        this.dirtySize = 0;

        /**
         * Color attachments for this framebuffer.
         *
         * @member {PIXI.BaseTexture[]}
         */
        this.colorTextures = [];

        /**
         * Texture to use as buffer for depth testing.
         *
         * @member {PIXI.BaseTexture}
         */
        this.depthTexture = null;

        /**
         * Map of renderer context-UIDs to `PIXI.GLFramebuffer`s.
         *
         * @member {Map<number, PIXI.GLFramebuffer>}
         */
        this.glFramebuffers = {};

        this.disposeRunner = new Runner('disposeFramebuffer');

        /**
         * Desired number of samples for antialiasing. 0 means AA should not be used.
         *
         * Experimental WebGL2 feature, allows to use antialiasing in individual renderTextures.
         * Antialiasing is the same as for main buffer with renderer `antialias:true` options.
         * Seriously affects GPU memory consumption and GPU performance.
         *
         *```js
         * renderTexture.framebuffer.multisample = PIXI.MSAA_QUALITY.HIGH;
         * //...
         * renderer.render(renderTexture, myContainer);
         * renderer.framebuffer.blit(); // copies data from MSAA framebuffer to texture
         *  ```
         *
         * @member {PIXI.MSAA_QUALITY}
         * @default PIXI.MSAA_QUALITY.NONE
         */
        this.multisample = MSAA_QUALITY.NONE;
    }

    /**
     * Reference to the colorTexture.
     *
     * @member {PIXI.BaseTexture[]}
     * @readonly
     */
    get colorTexture(): BaseTexture
    {
        return this.colorTextures[0];
    }

    /**
     * Add texture to the colorTexture array
     *
     * @param {number} [index=0] - Index of the array to add the texture to
     * @param {PIXI.BaseTexture} [texture] - Texture to add to the array
     */
    addColorTexture(index = 0, texture?: BaseTexture): this
    {
        // TODO add some validation to the texture - same width / height etc?
        this.colorTextures[index] = texture || new BaseTexture(null, { scaleMode: 0,
            resolution: 1,
            mipmap: MIPMAP_MODES.OFF,
            width: this.width,
            height: this.height });

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Add a depth texture to the frame buffer
     *
     * @param {PIXI.BaseTexture} [texture] - Texture to add
     */
    addDepthTexture(texture?: BaseTexture): this
    {
        /* eslint-disable max-len */
        this.depthTexture = texture || new BaseTexture(new DepthResource(null, { width: this.width, height: this.height }), { scaleMode: 0,
            resolution: 1,
            width: this.width,
            height: this.height,
            mipmap: MIPMAP_MODES.OFF,
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
    enableDepth(): this
    {
        this.depth = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Enable stencil on the frame buffer
     */
    enableStencil(): this
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
    resize(width: number, height: number): void
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
    dispose(): void
    {
        this.disposeRunner.emit(this, false);
    }
}
