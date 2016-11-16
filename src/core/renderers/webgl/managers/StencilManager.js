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
     * Applies the Mask and adds it to the current filter stack. @alvin
     *
     * @param {PIXI.Graphics} graphics - The mask
     */
    pushStencil(graphics)
    {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        this.renderer._activeRenderTarget.attachStencilBuffer();

        const gl = this.renderer.gl;
        const sms = this.stencilMaskStack;

        if (sms.length === 0)
        {
            gl.enable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.stencilFunc(gl.ALWAYS, 1, 1);
        }

        sms.push(graphics);

        gl.colorMask(false, false, false, false);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

        this.renderer.plugins.graphics.render(graphics);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, sms.length);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }

    /**
     * TODO @alvin
     */
    popStencil()
    {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        const gl = this.renderer.gl;
        const sms = this.stencilMaskStack;

        const graphics = sms.pop();

        if (sms.length === 0)
        {
            // the stack is empty!
            gl.disable(gl.STENCIL_TEST);
        }
        else
        {
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);

            this.renderer.plugins.graphics.render(graphics);

            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.NOTEQUAL, 0, sms.length);
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
