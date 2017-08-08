import WebGLManager from './WebGLManager';

/**
 * @class
 * @extends PIXI.WebGLManager
 * @memberof PIXI
 */
export default class StencilManager extends WebGLManager
{
    /**
     * @param {PIXI.WebGLRenderer} renderer - The renderer this manager works for.
     */
    constructor(renderer)
    {
        super(renderer);
        this.stencilMaskStack = null;
    }

    /**
     * Changes the mask stack that is used by this manager.
     *
     * @param {PIXI.Graphics[]} stencilMaskStack - The mask stack
     */
    setMaskStack(stencilMaskStack)
    {
        this.stencilMaskStack = stencilMaskStack;

        const gl = this.renderer.gl;

        if (stencilMaskStack.length === 0)
        {
            gl.disable(gl.STENCIL_TEST);
        }
        else
        {
            gl.enable(gl.STENCIL_TEST);
        }
    }

    /**
     * Applies the Mask and adds it to the current stencil stack. @alvin
     *
     * @param {PIXI.Graphics} graphics - The mask
     */
    pushStencil(graphics)
    {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        this.renderer._activeRenderTarget.attachStencilBuffer();

        const gl = this.renderer.gl;
        const sms = this.stencilMaskStack;
        const currentMasks = sms.length;
        const sFuncMask = Math.pow(2, currentMasks + 1) - 1;

        if (currentMasks === 0)
        {
            gl.enable(gl.STENCIL_TEST);
        }

        sms.push(graphics);

        gl.colorMask(false, false, false, false);
        gl.stencilFunc(gl.EQUAL, currentMasks, sFuncMask);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        this.renderer.plugins.graphics.render(graphics);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.EQUAL, currentMasks + 1, sFuncMask);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }

    /**
     * Removes the last mask from the stencil stack. @alvin
     */
    popStencil()
    {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        const gl = this.renderer.gl;
        const sms = this.stencilMaskStack;

        const graphics = sms.pop();
        const currentMasks = sms.length;
        const sFuncMask = Math.pow(2, currentMasks) - 1;

        if (currentMasks === 0)
        {
            // the stack is empty!
            gl.disable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.clearStencil(0);
        }
        else
        {
            gl.colorMask(false, false, false, false);
            gl.stencilFunc(gl.EQUAL, currentMasks + 1, (2 * sFuncMask) + 1);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

            this.renderer.plugins.graphics.render(graphics);

            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.EQUAL, currentMasks, sFuncMask);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        }
    }

    /**
     * Destroys the mask stack.
     *
     */
    destroy()
    {
        WebGLManager.prototype.destroy.call(this);

        this.stencilMaskStack.stencilStack = null;
    }
}
