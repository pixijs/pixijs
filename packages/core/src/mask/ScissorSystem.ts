import { AbstractMaskSystem } from './AbstractMaskSystem';

import type { Renderer } from '../Renderer';
import type { MaskData } from './MaskData';
import { Matrix, Rectangle } from '@pixi/math';

const tempMatrix = new Matrix();

/**
 * System plugin to the renderer to manage scissor masking.
 *
 * Scissor masking discards pixels outside of a rectangle called the scissor box. The scissor box is in the framebuffer
 * viewport's space; however, the mask's rectangle is projected from world-space to viewport space automatically
 * by this system.
 *
 * @memberof PIXI
 */
export class ScissorSystem extends AbstractMaskSystem
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        this.glConst = WebGLRenderingContext.SCISSOR_TEST;
    }

    getStackLength(): number
    {
        const maskData = this.maskStack[this.maskStack.length - 1];

        if (maskData)
        {
            return maskData._scissorCounter;
        }

        return 0;
    }

    /**
     * evaluates _boundsTransformed, _scissorRect for MaskData
     * @param maskData
     */
    calcScissorRect(maskData: MaskData): void
    {
        if (maskData._scissorRectLocal)
        {
            return;
        }

        const prevData = maskData._scissorRect;
        const { maskObject } = maskData;
        const { renderer } = this;
        const renderTextureSystem = renderer.renderTexture;

        maskObject.renderable = true;

        const rect = maskObject.getBounds();

        this.roundFrameToPixels(rect,
            renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution,
            renderTextureSystem.sourceFrame,
            renderTextureSystem.destinationFrame,
            renderer.projection.transform);

        maskObject.renderable = false;

        if (prevData)
        {
            rect.fit(prevData);
        }
        maskData._scissorRectLocal = rect;
    }

    private static isMatrixRotated(matrix: Matrix)
    {
        if (!matrix)
        {
            return false;
        }
        const { a, b, c, d } = matrix;

        // Skip if skew/rotation present in matrix, except for multiple of 90° rotation. If rotation
        // is a multiple of 90°, then either pair of (b,c) or (a,d) will be (0,0).
        return ((Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4)
            && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4));
    }

    /**
     * Test, whether the object can be scissor mask with current renderer projection.
     * Calls "calcScissorRect()" if its true.
     * @param maskData mask data
     * @returns whether Whether the object can be scissor mask
     */
    public testScissor(maskData: MaskData): boolean
    {
        const { maskObject } = maskData;

        if (!maskObject.isFastRect || !maskObject.isFastRect())
        {
            return false;
        }
        if (ScissorSystem.isMatrixRotated(maskObject.worldTransform))
        {
            return false;
        }
        if (ScissorSystem.isMatrixRotated(this.renderer.projection.transform))
        {
            return false;
        }

        this.calcScissorRect(maskData);

        const rect = maskData._scissorRectLocal;

        return rect.width > 0 && rect.height > 0;
    }

    private roundFrameToPixels(
        frame: Rectangle,
        resolution: number,
        bindingSourceFrame: Rectangle,
        bindingDestinationFrame: Rectangle,
        transform?: Matrix,
    )
    {
        if (ScissorSystem.isMatrixRotated(transform))
        {
            return;
        }

        transform = transform ? tempMatrix.copyFrom(transform) : tempMatrix.identity();

        // Get forward transform from world space to screen space
        transform
            .translate(-bindingSourceFrame.x, -bindingSourceFrame.y)
            .scale(
                bindingDestinationFrame.width / bindingSourceFrame.width,
                bindingDestinationFrame.height / bindingSourceFrame.height)
            .translate(bindingDestinationFrame.x, bindingDestinationFrame.y);

        // Convert frame to screen space
        (this.renderer.filter as any).transformAABB(transform, frame);

        frame.fit(bindingDestinationFrame);
        frame.x = Math.round(frame.x * resolution);
        frame.y = Math.round(frame.y * resolution);
        frame.width = Math.round(frame.width * resolution);
        frame.height = Math.round(frame.height * resolution);
    }

    /**
     * Applies the Mask and adds it to the current stencil stack.
     *
     * @author alvin
     * @param maskData - The mask data.
     */
    push(maskData: MaskData): void
    {
        if (!maskData._scissorRectLocal)
        {
            this.calcScissorRect(maskData);
        }

        const { gl } = this.renderer;

        if (!maskData._scissorRect)
        {
            gl.enable(gl.SCISSOR_TEST);
        }

        maskData._scissorCounter++;
        maskData._scissorRect = maskData._scissorRectLocal;
        this._useCurrent();
    }

    /**
     * This should be called after a mask is popped off the mask stack. It will rebind the scissor box to be latest with the
     * last mask in the stack.
     *
     * This can also be called when you directly modify the scissor box and want to restore PixiJS state.
     */
    pop(): void
    {
        const { gl } = this.renderer;

        if (this.getStackLength() > 0)
        {
            this._useCurrent();
        }
        else
        {
            gl.disable(gl.SCISSOR_TEST);
        }
    }

    /**
     * Setup renderer to use the current scissor data.
     * @private
     */
    _useCurrent(): void
    {
        const rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
        let y: number;

        if (this.renderer.renderTexture.current)
        {
            y = rect.y;
        }
        else
        {
            // flipY. In future we'll have it over renderTextures as an option
            y = this.renderer.height - rect.height - rect.y;
        }

        this.renderer.gl.scissor(rect.x, y, rect.width, rect.height);
    }
}
