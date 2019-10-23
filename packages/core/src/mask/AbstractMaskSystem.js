import { System } from '../System';

/**
 * System plugin to the renderer to manage masks of certain type
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class AbstractMaskSystem extends System
{
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer)
    {
        super(renderer);

        /**
         * The mask stack
         * @member {PIXI.MaskData[]}
         */
        this.maskStack = [];

        /**
         * Constant for gl.enable
         * @member {number}
         * @private
         */
        this.glConst = 0;
    }

    /**
     * gets count of masks of certain type
     * @returns {number}
     */
    getStackLength()
    {
        return this.maskStack.length;
    }

    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.MaskData[]} maskStack - The mask stack
     */
    setMaskStack(maskStack)
    {
        const { gl } = this.renderer;
        const curStackLen = this.getStackLength();

        this.maskStack = maskStack;

        const newStackLen = this.getStackLength();

        if (newStackLen !== curStackLen)
        {
            if (newStackLen === 0)
            {
                gl.disable(this.glConst);
            }
            else
            {
                gl.enable(this.glConst);
                this._useCurrent();
            }
        }
    }

    /**
     * Setup renderer to use the current mask data.
     * @private
     */
    _useCurrent()
    {
        // OVERWRITE;
    }

    /**
     * Destroys the mask stack.
     *
     */
    destroy()
    {
        super.destroy(this);

        this.maskStack = null;
    }
}
