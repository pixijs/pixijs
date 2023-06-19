import { FORMATS, MIPMAP_MODES, MSAA_QUALITY, SCALE_MODES, TYPES } from '@pixi/constants';
import { Runner } from '@pixi/runner';
import { BaseTexture } from '../textures/BaseTexture';

import type { GLFramebuffer } from './GLFramebuffer';

/**
 * A framebuffer can be used to render contents off of the screen. {@link PIXI.BaseRenderTexture} uses
 * one internally to render into itself. You can attach a depth or stencil buffer to a framebuffer.
 *
 * On WebGL 2 machines, shaders can output to multiple textures simultaneously with GLSL 300 ES.
 * @memberof PIXI
 */
export class Framebuffer
{
    /** Width of framebuffer in pixels. */
    public width: number;

    /** Height of framebuffer in pixels. */
    public height: number;

    /**
     * Desired number of samples for antialiasing. 0 means AA should not be used.
     *
     * Experimental WebGL2 feature, allows to use antialiasing in individual renderTextures.
     * Antialiasing is the same as for main buffer with renderer `antialias: true` options.
     * Seriously affects GPU memory consumption and GPU performance.
     * @example
     * import { MSAA_QUALITY } from 'pixi.js';
     *
     * renderTexture.framebuffer.multisample = MSAA_QUALITY.HIGH;
     * // ...
     * renderer.render(myContainer, { renderTexture });
     * renderer.framebuffer.blit(); // Copies data from MSAA framebuffer to texture
     * @default PIXI.MSAA_QUALITY.NONE
     */
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
     * @param width - Width of the frame buffer
     * @param height - Height of the frame buffer
     */
    constructor(width: number, height: number)
    {
        this.width = Math.round(width);
        this.height = Math.round(height);

        if (!this.width || !this.height)
        {
            throw new Error('Framebuffer width or height is zero');
        }

        this.stencil = false;
        this.depth = false;

        this.dirtyId = 0;
        this.dirtyFormat = 0;
        this.dirtySize = 0;

        this.depthTexture = null;
        this.colorTextures = [];

        this.glFramebuffers = {};

        this.disposeRunner = new Runner('disposeFramebuffer');
        this.multisample = MSAA_QUALITY.NONE;
    }

    /**
     * Reference to the colorTexture.
     * @readonly
     */
    get colorTexture(): BaseTexture
    {
        return this.colorTextures[0];
    }

    /**
     * Add texture to the colorTexture array.
     * @param index - Index of the array to add the texture to
     * @param texture - Texture to add to the array
     */
    addColorTexture(index = 0, texture?: BaseTexture): this
    {
        // TODO add some validation to the texture - same width / height etc?
        this.colorTextures[index] = texture || new BaseTexture(null, {
            scaleMode: SCALE_MODES.NEAREST,
            resolution: 1,
            mipmap: MIPMAP_MODES.OFF,
            width: this.width,
            height: this.height,
        });

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Add a depth texture to the frame buffer.
     * @param texture - Texture to add.
     */
    addDepthTexture(texture?: BaseTexture): this
    {
        this.depthTexture = texture || new BaseTexture(null, {
            scaleMode: SCALE_MODES.NEAREST,
            resolution: 1,
            width: this.width,
            height: this.height,
            mipmap: MIPMAP_MODES.OFF,
            format: FORMATS.DEPTH_COMPONENT,
            type: TYPES.UNSIGNED_SHORT,
        });

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /** Enable depth on the frame buffer. */
    enableDepth(): this
    {
        this.depth = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /** Enable stencil on the frame buffer. */
    enableStencil(): this
    {
        this.stencil = true;

        this.dirtyId++;
        this.dirtyFormat++;

        return this;
    }

    /**
     * Resize the frame buffer
     * @param width - Width of the frame buffer to resize to
     * @param height - Height of the frame buffer to resize to
     */
    resize(width: number, height: number): void
    {
        width = Math.round(width);
        height = Math.round(height);

        if (!width || !height)
        {
            throw new Error('Framebuffer width and height must not be zero');
        }

        if (width === this.width && height === this.height) return;

        this.width = width;
        this.height = height;

        this.dirtyId++;
        this.dirtySize++;

        for (let i = 0; i < this.colorTextures.length; i++)
        {
            const texture = this.colorTextures[i];
            const resolution = texture.resolution;

            // take into account the fact the texture may have a different resolution..
            texture.setSize(width / resolution, height / resolution);
        }

        if (this.depthTexture)
        {
            const resolution = this.depthTexture.resolution;

            this.depthTexture.setSize(width / resolution, height / resolution);
        }
    }

    /** Disposes WebGL resources that are connected to this geometry. */
    dispose(): void
    {
        this.disposeRunner.emit(this, false);
    }

    /** Destroys and removes the depth texture added to this framebuffer. */
    destroyDepthTexture(): void
    {
        if (this.depthTexture)
        {
            this.depthTexture.destroy();
            this.depthTexture = null;

            ++this.dirtyId;
            ++this.dirtyFormat;
        }
    }
}
