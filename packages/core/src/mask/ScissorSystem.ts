import { AbstractMaskSystem } from './AbstractMaskSystem';

import type { Renderer } from '../Renderer';
import type { MaskData } from './MaskData';
import { FILTER_CHECK_RESULT, MASK_TYPES } from '@pixi/constants';
import { IMaskHandler } from '@pixi/core';
import { Matrix, Rectangle } from '@pixi/math';

export class ScissorMaskHandler implements IMaskHandler
{
    beforeMaskPush(renderer: Renderer, maskData: MaskData): void
    {
        if (maskData.type !== MASK_TYPES.SCISSOR)
        {
            return;
        }

        renderer.scissor.calcScissorRect(maskData);

        const rect = maskData._scissorRect;

        if (rect.width < 1 || rect.height < 1)
        {
            maskData.checkResult = FILTER_CHECK_RESULT.DONT_RENDER;
        }
    }
}

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
     * Applies the Mask and adds it to the current stencil stack.
     *
     * @author alvin
     * @param maskData - The mask data.
     */
    push(maskData: MaskData): void
    {
        const maskObject = maskData.maskObject;

        maskObject.renderable = true;

        if (!maskData._boundsTransformed)
        {
            this.calcScissorRect(maskData);
        }

        const { gl } = this.renderer;

        maskObject.renderable = false;

        if (maskData._scissorCounter === 0)
        {
            gl.enable(gl.SCISSOR_TEST);
        }

        maskData._scissorCounter++;
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
     * evaluates _boundsTransformed, _scissorRect for MaskData
     * @param maskData
     */
    calcScissorRect(maskData: MaskData): void
    {
        const prevData = maskData._scissorRect;
        const { renderer } = this;
        const renderTextureSystem = renderer.renderTexture;

        maskData._boundsTransformed = maskData.maskObject.getBounds();
        this.roundFrameToPixels(maskData._boundsTransformed,
            renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution,
            renderTextureSystem.sourceFrame,
            renderTextureSystem.destinationFrame,
            renderer.projection.transform);

        const rect = maskData._boundsTransformed.clone();

        if (prevData)
        {
            rect.fit(prevData);
        }
        maskData._scissorRect = rect;
    }

    /**
     * Setup renderer to use the current scissor data.
     * @private
     */
    _useCurrent(): void
    {
        const rect = this.maskStack[this.maskStack.length - 1]._scissorRect;

        if (!this.renderer.renderTexture.current)
        {
            // flipY. In future we'll have it over renderTextures as an option
            rect.y = this.renderer.height - rect.height - rect.y;
        }

        this.renderer.gl.scissor(rect.x, rect.y, rect.width, rect.height);
    }

    private roundFrameToPixels(
        frame: Rectangle,
        resolution: number,
        bindingSourceFrame: Rectangle,
        bindingDestinationFrame: Rectangle,
        transform?: Matrix,
    )
    {
        if (transform)
        {
            const { a, b, c, d } = transform;

            // Skip if skew/rotation present in matrix, except for multiple of 90° rotation. If rotation
            // is a multiple of 90°, then either pair of (b,c) or (a,d) will be (0,0).
            if ((Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4)
                && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4))
            {
                return;
            }
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
}
