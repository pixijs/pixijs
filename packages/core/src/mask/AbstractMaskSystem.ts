import type { ISystem } from '../system/ISystem';
import type { MaskData } from './MaskData';
import type { Renderer } from '../Renderer';

/**
 * System plugin to the renderer to manage specific types of masking operations.
 *
 * @memberof PIXI
 */
export class AbstractMaskSystem implements ISystem
{
    /**
     * The mask stack
     * @member {PIXI.MaskData[]}
     */
    protected maskStack: Array<MaskData>;

    /**
     * Constant for gl.enable
     * @private
     */
    protected glConst: number;
    protected renderer: Renderer;

    /**
     * @param renderer - The renderer this System works for.
     */
    constructor(renderer: Renderer)
    {
        this.renderer = renderer;

        this.maskStack = [];
        this.glConst = 0;
    }

    /** Gets count of masks of certain type. */
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

    /** Destroys the mask stack. */
    destroy(): void
    {
        this.renderer = null;
        this.maskStack = null;
    }
}
