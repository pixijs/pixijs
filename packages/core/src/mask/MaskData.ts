import { MASK_TYPES, MSAA_QUALITY } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { ISpriteMaskFilter } from '@pixi/core';

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
 * Component for masked elements.
 *
 * Holds mask mode and temporary data about current mask.
 *
 * @memberof PIXI
 */
export class MaskData
{
    /** Mask type */
    public type: MASK_TYPES;

    /**
     * Whether we know the mask type beforehand
     * @default true
     */
    public autoDetect: boolean;

    /**
     * Which element we use to mask
     * @member {PIXI.DisplayObject}
     */
    public maskObject: IMaskTarget;

    /** Whether it belongs to MaskSystem pool */
    public pooled: boolean;

    /** Indicator of the type (always true for {@link MaskData} objects) */
    public isMaskData: boolean;// webdoc crashes if the type is true because reasons... (will fix)

    /**
     * Resolution of the sprite mask filter.
     * If set to `null` or `0`, the resolution of the current render target is used.
     * @default null
     */
    public resolution: number;

    /**
     * Number of samples of the sprite mask filter.
     * If set to `null`, the sample count of the current render target is used.
     * @default PIXI.settings.FILTER_MULTISAMPLE
     */
    public multisample: MSAA_QUALITY;

    /** If enabled is true the mask is applied, if false it will not. */
    public enabled: boolean;

    /**
     * The sprite mask filter wrapped in an array.
     * @private
     */
    _filters: ISpriteMaskFilter[];

    /**
     * Stencil counter above the mask in stack
     * @private
     */
    _stencilCounter: number;

    /**
     * Scissor counter above the mask in stack
     * @private
     */
    _scissorCounter: number;

    /**
     * Scissor operation above the mask in stack.
     * Null if _scissorCounter is zero, rectangle instance if positive.
     */
    _scissorRect: Rectangle;

    /**
     * pre-computed scissor rect
     * does become _scissorRect when mask is actually pushed
     */
    _scissorRectLocal: Rectangle;

    /**
     * Targeted element. Temporary variable set by MaskSystem
     * @member {PIXI.DisplayObject}
     * @private
     */
    _target: IMaskTarget;

    /**
     * Create MaskData
     *
     * @param {PIXI.DisplayObject} [maskObject=null] - object that describes the mask
     */
    constructor(maskObject: IMaskTarget = null)
    {
        this.type = MASK_TYPES.NONE;
        this.autoDetect = true;
        this.maskObject = maskObject || null;
        this.pooled = false;
        this.isMaskData = true;
        this.resolution = null;
        this.multisample = settings.FILTER_MULTISAMPLE;
        this.enabled = true;
        this._filters = null;
        this._stencilCounter = 0;
        this._scissorCounter = 0;
        this._scissorRect = null;
        this._scissorRectLocal = null;
        this._target = null;
    }

    /**
     * The sprite mask filter.
     * If set to `null`, the default sprite mask filter is used.
     * @default null
     */
    get filter(): ISpriteMaskFilter
    {
        return this._filters ? this._filters[0] : null;
    }

    set filter(value: ISpriteMaskFilter)
    {
        if (value)
        {
            if (this._filters)
            {
                this._filters[0] = value;
            }
            else
            {
                this._filters = [value];
            }
        }
        else
        {
            this._filters = null;
        }
    }

    /** Resets the mask data after popMask(). */
    reset(): void
    {
        if (this.pooled)
        {
            this.maskObject = null;

            this.type = MASK_TYPES.NONE;

            this.autoDetect = true;
        }

        this._target = null;
        this._scissorRectLocal = null;
    }

    /** Copies counters from maskData above, called from pushMask(). */
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
