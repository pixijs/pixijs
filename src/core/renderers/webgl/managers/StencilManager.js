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
        const prevMaskCount = this.stencilMaskStack.length;

        if (prevMaskCount === 0)
        {
            gl.enable(gl.STENCIL_TEST);
        }

        this.stencilMaskStack.push(graphics);

        // Increment the refference stencil value where the new mask overlaps with the old ones.
        gl.colorMask(false, false, false, false);
        gl.stencilFunc(gl.EQUAL, prevMaskCount, this._getBitwiseMask());
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
        this.renderer.plugins.graphics.render(graphics);

        this._useCurrent();
    }

    /**
     * Removes the last mask from the stencil stack. @alvin
     */
    popStencil()
    {
        this.renderer.setObjectRenderer(this.renderer.plugins.graphics);

        const gl = this.renderer.gl;
        const graphics = this.stencilMaskStack.pop();

        if (this.stencilMaskStack.length === 0)
        {
            // the stack is empty!
            gl.disable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.clearStencil(0);
        }
        else
        {
            // Decrement the refference stencil value where the popped mask overlaps with the other ones
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            this.renderer.plugins.graphics.render(graphics);

            this._useCurrent();
        }
    }

    /**
     * Setup renderer to use the current stencil data.
     */
    _useCurrent()
    {
        const gl = this.renderer.gl;

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.EQUAL, this.stencilMaskStack.length, this._getBitwiseMask());
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }

    /**
     * Fill 1s equal to the number of acitve stencil masks.
     *
     * @return {number} The bitwise mask.
     */
    _getBitwiseMask()
    {
        return (1 << this.stencilMaskStack.length) - 1;
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
