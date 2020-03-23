import { System } from '../System';

import type { MaskData } from './MaskData';
import type { Renderer } from '../Renderer';

/**
 * System plugin to the renderer to manage masks of certain type
 *
 * @class
 * @extends PIXI.System
 * @memberof PIXI.systems
 */
export class AbstractMaskSystem extends System
{
    protected maskStack: Array<MaskData>;
    protected glConst: number;
    /**
     * @param {PIXI.Renderer} renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
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
    getStackLength(): number
    {
        return this.maskStack.length;
    }

    /**
     * Changes the mask stack that is used by this System.
     *
     * @param {PIXI.MaskData[]} maskStack - The mask stack
     */
    setMaskStack(maskStack: Array<MaskData>): void
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
    protected _useCurrent(): void
    {
        // OVERWRITE;
    }

    /**
     * Destroys the mask stack.
     *
     */
    destroy(): void
    {
        super.destroy();

        this.maskStack = null;
    }
}
