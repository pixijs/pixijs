import { System } from '../System';
import { Rectangle } from '@pixi/math';
import { BUFFER_BITS } from '@pixi/constants';

import type { Renderer } from '../Renderer';
import type { RenderTexture } from './RenderTexture';
import type { BaseRenderTexture } from './BaseRenderTexture';
import type { MaskData } from '../mask/MaskData';

const tempRect = new Rectangle();

/**
 * System plugin to the renderer to manage render textures.
 *
 * Should be added after FramebufferSystem
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */

export class RenderTextureSystem extends System
{
    public clearColor: number[];
    public defaultMaskStack: Array<MaskData>;
    public current: RenderTexture;
    public readonly sourceFrame: Rectangle;
    public readonly destinationFrame: Rectangle;

    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        /**
         * The clear background color as rgba
         * @member {number[]}
         */
        this.clearColor = renderer._backgroundColorRgba;

        // TODO move this property somewhere else!
        /**
         * List of masks for the StencilSystem
         * @member {PIXI.Graphics[]}
         * @readonly
         */
        this.defaultMaskStack = [];

        // empty render texture?
        /**
         * Render texture
         * @member {PIXI.RenderTexture}
         * @readonly
         */
        this.current = null;

        /**
         * Source frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        this.sourceFrame = new Rectangle();

        /**
         * Destination frame
         * @member {PIXI.Rectangle}
         * @readonly
         */
        this.destinationFrame = new Rectangle();
    }

    /**
     * Bind the current render texture
     * @param {PIXI.RenderTexture} [renderTexture] - RenderTexture to bind, by default its `null`, the screen
     * @param {PIXI.Rectangle} [sourceFrame] - part of screen that is mapped to the renderTexture
     * @param {PIXI.Rectangle} [destinationFrame] - part of renderTexture, by default it has the same size as sourceFrame
     */
    bind(renderTexture: RenderTexture = null, sourceFrame?: Rectangle, destinationFrame?: Rectangle): void
    {
        this.current = renderTexture;

        const renderer = this.renderer;

        let resolution;

        if (renderTexture)
        {
            const baseTexture = renderTexture.baseTexture as BaseRenderTexture;

            resolution = baseTexture.resolution;

            if (!destinationFrame)
            {
                tempRect.width = baseTexture.realWidth;
                tempRect.height = baseTexture.realHeight;

                destinationFrame = tempRect;
            }

            if (!sourceFrame)
            {
                sourceFrame = destinationFrame;
            }

            this.renderer.framebuffer.bind(baseTexture.framebuffer, destinationFrame);

            this.renderer.projection.update(destinationFrame, sourceFrame, resolution, false);
            this.renderer.mask.setMaskStack(baseTexture.maskStack);
        }
        else
        {
            resolution = this.renderer.resolution;

            // TODO these validation checks happen deeper down..
            // thing they can be avoided..
            if (!destinationFrame)
            {
                tempRect.width = renderer.width;
                tempRect.height = renderer.height;

                destinationFrame = tempRect;
            }

            if (!sourceFrame)
            {
                sourceFrame = destinationFrame;
            }

            renderer.framebuffer.bind(null, destinationFrame);

            // TODO store this..
            this.renderer.projection.update(destinationFrame, sourceFrame, resolution, true);
            this.renderer.mask.setMaskStack(this.defaultMaskStack);
        }

        this.sourceFrame.copyFrom(sourceFrame);

        this.destinationFrame.x = destinationFrame.x / resolution;
        this.destinationFrame.y = destinationFrame.y / resolution;

        this.destinationFrame.width = destinationFrame.width / resolution;
        this.destinationFrame.height = destinationFrame.height / resolution;

        if (sourceFrame === destinationFrame)
        {
            this.sourceFrame.copyFrom(this.destinationFrame);
        }
    }

    /**
     * Erases the render texture and fills the drawing area with a colour
     *
     * @param {number[]} [clearColor] - The color as rgba, default to use the renderer backgroundColor
     * @param {PIXI.BUFFER_BITS} [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
     *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
     * @return {PIXI.Renderer} Returns itself.
     */
    clear(clearColor?: number[], mask?: BUFFER_BITS): void
    {
        if (this.current)
        {
            clearColor = clearColor || (this.current.baseTexture as BaseRenderTexture).clearColor;
        }
        else
        {
            clearColor = clearColor || this.clearColor;
        }

        this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3], mask);
    }

    resize(): void // screenWidth, screenHeight)
    {
        // resize the root only!
        this.bind(null);
    }

    /**
     * Resets renderTexture state
     */
    reset(): void
    {
        this.bind(null);
    }
}
