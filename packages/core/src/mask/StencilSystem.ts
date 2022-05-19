import { AbstractMaskSystem } from './AbstractMaskSystem';

import type { Renderer } from '../Renderer';
import type { IMaskTarget, MaskData } from './MaskData';

/**
 * System plugin to the renderer to manage stencils (used for masks).
 *
 * @memberof PIXI
 */
export class StencilSystem extends AbstractMaskSystem
{
    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        super(renderer);

        this.glConst = WebGLRenderingContext.STENCIL_TEST;
    }

    getStackLength(): number
    {
        const maskData = this.maskStack[this.maskStack.length - 1];

        if (maskData)
        {
            return maskData._stencilCounter;
        }

        return 0;
    }

    /**
     * Applies the Mask and adds it to the current stencil stack.
     *
     * @param maskData - The mask data
     */
    push(maskData: MaskData): void
    {
        const maskObject = maskData.maskObject;
        const { gl } = this.renderer;
        const prevMaskCount = maskData._stencilCounter;

        if (prevMaskCount === 0)
        {
            // force use stencil texture in current framebuffer
            this.renderer.framebuffer.forceStencil();
            gl.clearStencil(0);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.enable(gl.STENCIL_TEST);
        }

        maskData._stencilCounter++;

        const colorMask = maskData._colorMask;

        if (colorMask !== 0)
        {
            maskData._colorMask = 0;
            gl.colorMask(false, false, false, false);
        }

        // Increment the reference stencil value where the new mask overlaps with the old ones.
        gl.stencilFunc(gl.EQUAL, prevMaskCount, 0xFFFFFFFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        maskObject.renderable = true;
        maskObject.render(this.renderer);
        this.renderer.batch.flush();
        maskObject.renderable = false;

        if (colorMask !== 0)
        {
            maskData._colorMask = colorMask;
            gl.colorMask(
                (colorMask & 1) !== 0,
                (colorMask & 2) !== 0,
                (colorMask & 4) !== 0,
                (colorMask & 8) !== 0
            );
        }

        this._useCurrent();
    }

    /**
     * Pops stencil mask. MaskData is already removed from stack
     *
     * @param {PIXI.DisplayObject} maskObject - object of popped mask data
     */
    pop(maskObject: IMaskTarget): void
    {
        const gl = this.renderer.gl;

        if (this.getStackLength() === 0)
        {
            // the stack is empty!
            gl.disable(gl.STENCIL_TEST);
        }
        else
        {
            const maskData = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null;
            const colorMask = maskData ? maskData._colorMask : 0xf;

            if (colorMask !== 0)
            {
                maskData._colorMask = 0;
                gl.colorMask(false, false, false, false);
            }

            // Decrement the reference stencil value where the popped mask overlaps with the other ones
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

            maskObject.renderable = true;
            maskObject.render(this.renderer);
            this.renderer.batch.flush();
            maskObject.renderable = false;

            if (colorMask !== 0)
            {
                maskData._colorMask = colorMask;
                gl.colorMask(
                    (colorMask & 0x1) !== 0,
                    (colorMask & 0x2) !== 0,
                    (colorMask & 0x4) !== 0,
                    (colorMask & 0x8) !== 0
                );
            }

            this._useCurrent();
        }
    }

    /**
     * Setup renderer to use the current stencil data.
     * @private
     */
    _useCurrent(): void
    {
        const gl = this.renderer.gl;

        gl.stencilFunc(gl.EQUAL, this.getStackLength(), 0xFFFFFFFF);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }
}
