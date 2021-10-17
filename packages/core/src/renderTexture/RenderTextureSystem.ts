import { Rectangle } from '@pixi/math';
import { BUFFER_BITS } from '@pixi/constants';

import type { ISystem } from '../ISystem';
import type { Renderer } from '../Renderer';
import type { RenderTexture } from './RenderTexture';
import type { BaseRenderTexture } from './BaseRenderTexture';
import type { MaskData } from '../mask/MaskData';
import type { ISize } from '@pixi/math';

// Temporary rectangle for assigned sourceFrame or destinationFrame
const tempRect = new Rectangle();

// Temporary rectangle for renderTexture destinationFrame
const tempRect2 = new Rectangle();

/* eslint-disable max-len */
/**
 * System plugin to the renderer to manage render textures.
 *
 * Should be added after FramebufferSystem
 *
 * ### Frames
 *
 * The `RenderTextureSystem` holds a sourceFrame → destinationFrame projection. The following table explains the different
 * coordinate spaces used:
 *
 * | Frame                  | Description                                                      | Coordinate System                                       |
 * | ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
 * | sourceFrame            | The rectangle inside of which display-objects are being rendered | **World Space**: The origin on the top-left             |
 * | destinationFrame       | The rectangle in the render-target (canvas or texture) into which contents should be rendered | If rendering to the canvas, this is in screen space and the origin is on the top-left. If rendering to a render-texture, this is in its base-texture's space with the origin on the bottom-left.  |
 * | viewportFrame          | The framebuffer viewport corresponding to the destination-frame  | **Window Coordinates**: The origin is always on the bottom-left. |
 *
 * @memberof PIXI
 */
export class RenderTextureSystem implements ISystem
{
/* eslint-enable max-len */

    /** The clear background color as RGBA. */
    public clearColor: number[];

    /**
     * List of masks for the {@link PIXI.StencilSystem}.
     *
     * @readonly
     */
    public defaultMaskStack: Array<MaskData>;

    /**
     * Render texture currently bound. {@code null} if rendering to the canvas.
     *
     * @readonly
     */
    public current: RenderTexture | null;

    /**
     * The source frame for the render-target's projection mapping.
     *
     * See {@link PIXI.ProjectionSystem#sourceFrame} for more details
     */
    public readonly sourceFrame: Rectangle;

    /**
     * The destination frame for the render-target's projection mapping.
     *
     * See {@link PIXI.Projection#destinationFrame} for more details.
     */
    public readonly destinationFrame: Rectangle;

    /**
     * The viewport frame for the render-target's viewport binding. This is equal to the destination-frame
     * for render-textures, while it is y-flipped when rendering to the screen (i.e. its origin is always on
     * the bottom-left).
     */
    public readonly viewportFrame: Rectangle;

    private renderer: Renderer;

    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.clearColor = renderer._backgroundColorRgba;
        this.defaultMaskStack = [];
        this.current = null;
        this.sourceFrame = new Rectangle();
        this.destinationFrame = new Rectangle();
        this.viewportFrame = new Rectangle();
    }

    /**
     * Bind the current render texture.
     *
     * @param renderTexture - RenderTexture to bind, by default its `null` - the screen.
     * @param sourceFrame - Part of world that is mapped to the renderTexture.
     * @param destinationFrame - Part of renderTexture, by default it has the same size as sourceFrame.
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

        const viewportFrame = this.viewportFrame;

        viewportFrame.x = destinationFrame.x * resolution;
        viewportFrame.y = destinationFrame.y * resolution;
        viewportFrame.width = destinationFrame.width * resolution;
        viewportFrame.height = destinationFrame.height * resolution;

        if (!renderTexture)
        {
            viewportFrame.y = renderer.view.height - (viewportFrame.y + viewportFrame.height);
        }

        viewportFrame.ceil();

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
     * Erases the render texture and fills the drawing area with a colour.
     *
     * @param clearColor - The color as rgba, default to use the renderer backgroundColor
     * @param [mask=BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH] - Bitwise OR of masks
     *  that indicate the buffers to be cleared, by default COLOR and DEPTH buffers.
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

        const destinationFrame = this.destinationFrame;
        const baseFrame: ISize = this.current ? this.current.baseTexture : this.renderer.screen;
        const clearMask = destinationFrame.width !== baseFrame.width || destinationFrame.height !== baseFrame.height;

        if (clearMask)
        {
            let { x, y, width, height } = this.viewportFrame;

            x = Math.round(x);
            y = Math.round(y);
            width = Math.round(width);
            height = Math.round(height);

            // TODO: ScissorSystem should cache whether the scissor test is enabled or not.
            this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);
            this.renderer.gl.scissor(x, y, width, height);
        }

        this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3], mask);

        if (clearMask)
        {
            // Restore the scissor box
            this.renderer.scissor.pop();
        }
    }

    resize(): void // screenWidth, screenHeight)
    {
        // resize the root only!
        this.bind(null);
    }

    /** Resets render-texture state. */
    reset(): void
    {
        this.bind(null);
    }

    destroy(): void
    {
        this.renderer = null;
    }
}
