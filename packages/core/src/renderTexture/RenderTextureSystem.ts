import { System } from '../System';
import { Rectangle } from '@pixi/math';
import { BUFFER_BITS } from '@pixi/constants';

import type { Renderer } from '../Renderer';
import type { RenderTexture } from './RenderTexture';
import type { BaseRenderTexture } from './BaseRenderTexture';
import type { MaskData } from '../mask/MaskData';

// Temporary rectangle for assigned sourceFrame or destinationFrame
const tempRect = new Rectangle();

// Temporary rectangle for renderTexture destinationFrame
const tempRect2 = new Rectangle();

// Temporary rectangle for passing the framebuffer viewport
const viewportFrame = new Rectangle();

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
     *
     * @param {PIXI.RenderTexture} [renderTexture] - RenderTexture to bind, by default its `null`, the screen
     * @param {PIXI.Rectangle} [sourceFrame] - part of screen that is mapped to the renderTexture
     * @param {PIXI.Rectangle} [destinationFrame] - part of renderTexture, by default it has the same size as sourceFrame
     */
    bind(renderTexture: RenderTexture = null, sourceFrame?: Rectangle, destinationFrame?: Rectangle): void
    {
        const renderer = this.renderer;

        this.current = renderTexture;

        let baseTexture: BaseRenderTexture;
        let framebuffer;
        let resolution;

        if (renderTexture)
        {
            baseTexture = renderTexture.baseTexture as BaseRenderTexture;

            resolution = baseTexture.resolution;

            if (!sourceFrame)
            {
                tempRect.width = renderTexture.frame.width;
                tempRect.height = renderTexture.frame.height;

                sourceFrame = tempRect;
            }

            if (!destinationFrame)
            {
                tempRect2.x = renderTexture.frame.x;
                tempRect2.y = renderTexture.frame.y;
                tempRect2.width = sourceFrame.width;
                tempRect2.height = sourceFrame.height;

                destinationFrame = tempRect2;
            }

            framebuffer = baseTexture.framebuffer;
        }
        else
        {
            resolution = renderer.resolution;

            if (!sourceFrame)
            {
                tempRect.width = renderer.screen.width;
                tempRect.height = renderer.screen.height;

                sourceFrame = tempRect;
            }

            if (!destinationFrame)
            {
                destinationFrame = tempRect;

                destinationFrame.width = sourceFrame.width;
                destinationFrame.height = sourceFrame.height;
            }
        }

        viewportFrame.x = destinationFrame.x * resolution;
        viewportFrame.y = destinationFrame.y * resolution;
        viewportFrame.width = destinationFrame.width * resolution;
        viewportFrame.height = destinationFrame.height * resolution;

        this.renderer.framebuffer.bind(framebuffer, viewportFrame);
        this.renderer.projection.update(destinationFrame, sourceFrame, resolution, !framebuffer);

        if (renderTexture)
        {
            this.renderer.mask.setMaskStack(baseTexture.maskStack);
        }
        else
        {
            this.renderer.mask.setMaskStack(this.defaultMaskStack);
        }

        this.sourceFrame.copyFrom(sourceFrame);
        this.destinationFrame.copyFrom(destinationFrame);
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
