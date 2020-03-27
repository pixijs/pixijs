import { MASK_TYPES } from '@pixi/constants';

import type { Rectangle, Matrix } from '@pixi/math';
import type { IFilterTarget } from '../filters/IFilterTarget';
import type { Renderer } from '../Renderer';

export interface IMaskTarget extends IFilterTarget
{
    renderable: boolean;
    isSprite?: boolean;
    worldTransform: Matrix;
    isFastRect?(): boolean;
    getBounds(skipUpdate?: boolean): Rectangle;
    render(renderer: Renderer): void;
}
/**
 * Component for masked elements
 *
 * Holds mask mode and temporary data about current mask
 *
 * @class
 * @memberof PIXI
 */
export class MaskData
{
    public type: MASK_TYPES;
    public autoDetect: boolean;
    public maskObject: IMaskTarget;
    public pooled: boolean;
    public isMaskData: true;
    _stencilCounter: number;
    _scissorCounter: number;
    _scissorRect: Rectangle;
    _target: IMaskTarget;

    /**
     * Create MaskData
     *
     * @param {PIXI.DisplayObject} [maskObject=null] object that describes the mask
     */
    constructor(maskObject: IMaskTarget = null)
    {
        /**
         * Mask type
         * @member {PIXI.MASK_TYPES}
         */
        this.type = MASK_TYPES.NONE;

        /**
         * Whether we know the mask type beforehand
         * @member {boolean}
         * @default true
         */
        this.autoDetect = true;

        /**
         * Which element we use to mask
         * @member {PIXI.DisplayObject}
         */
        this.maskObject = maskObject || null;

        /**
         * Whether it belongs to MaskSystem pool
         * @member {boolean}
         */
        this.pooled = false;

        /**
         * Indicator of the type
         * @member {boolean}
         */
        this.isMaskData = true;

        /**
         * Stencil counter above the mask in stack
         * @member {number}
         * @private
         */
        this._stencilCounter = 0;
        /**
         * Scissor counter above the mask in stack
         * @member {number}
         * @private
         */
        this._scissorCounter = 0;

        /**
         * Scissor operation above the mask in stack.
         * Null if _scissorCounter is zero, rectangle instance if positive.
         * @member {PIXI.Rectangle}
         */
        this._scissorRect = null;

        /**
         * Targeted element. Temporary variable set by MaskSystem
         * @member {PIXI.DisplayObject}
         * @private
         */
        this._target = null;
    }

    /**
     * resets the mask data after popMask()
     */
    reset(): void
    {
        if (this.pooled)
        {
            this.maskObject = null;

            this.type = MASK_TYPES.NONE;

            this.autoDetect = true;
        }

        this._target = null;
    }

    /**
     * copies counters from maskData above, called from pushMask()
     * @param {PIXI.MaskData|null} maskAbove
     */
    copyCountersOrReset(maskAbove?: MaskData): void
    {
        if (maskAbove)
        {
            this._stencilCounter = maskAbove._stencilCounter;
            this._scissorCounter = maskAbove._scissorCounter;
            this._scissorRect = maskAbove._scissorRect;
        }
        else
        {
            this._stencilCounter = 0;
            this._scissorCounter = 0;
            this._scissorRect = null;
        }
    }
}
