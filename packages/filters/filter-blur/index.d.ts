import type { BLEND_MODES } from '@pixi/constants';
import { CLEAR_MODES } from '@pixi/constants';
import { Filter } from '@pixi/core';
import type { RenderTexture } from '@pixi/core';
import type { systems } from '@pixi/core';

/**
 * The BlurFilter applies a Gaussian blur to an object.
 *
 * The strength of the blur can be set for the x-axis and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export declare class BlurFilter extends Filter {
    blurXFilter: BlurFilterPass;
    blurYFilter: BlurFilterPass;
    private _repeatEdgePixels;
    /**
     * @param {number} [strength=8] - The strength of the blur filter.
     * @param {number} [quality=4] - The quality of the blur filter.
     * @param {number} [resolution=1] - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(strength?: number, quality?: number, resolution?: number, kernelSize?: number);
    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {PIXI.CLEAR_MODES} clearMode - How to clear
     */
    apply(filterManager: systems['FilterSystem'], input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
    protected updatePadding(): void;
    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @default 2
     */
    get blur(): number;
    set blur(value: number);
    /**
     * Sets the number of passes for blur. More passes means higher quaility bluring.
     *
     * @member {number}
     * @default 1
     */
    get quality(): number;
    set quality(value: number);
    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @default 2
     */
    get blurX(): number;
    set blurX(value: number);
    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @default 2
     */
    get blurY(): number;
    set blurY(value: number);
    /**
     * Sets the blendmode of the filter
     *
     * @member {number}
     * @default PIXI.BLEND_MODES.NORMAL
     */
    get blendMode(): BLEND_MODES;
    set blendMode(value: BLEND_MODES);
    /**
     * If set to true the edge of the target will be clamped
     *
     * @member {boolean}
     * @default false
     */
    get repeatEdgePixels(): boolean;
    set repeatEdgePixels(value: boolean);
}

/**
 * The BlurFilterPass applies a horizontal or vertical Gaussian blur to an object.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export declare class BlurFilterPass extends Filter {
    horizontal: boolean;
    strength: number;
    passes: number;
    private _quality;
    /**
     * @param {boolean} horizontal - Do pass along the x-axis (`true`) or y-axis (`false`).
     * @param {number} [strength=8] - The strength of the blur filter.
     * @param {number} [quality=4] - The quality of the blur filter.
     * @param {number} [resolution=1] - The resolution of the blur filter.
     * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
     */
    constructor(horizontal: boolean, strength?: number, quality?: number, resolution?: number, kernelSize?: number);
    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {PIXI.CLEAR_MODES} clearMode - How to clear
     */
    apply(filterManager: systems['FilterSystem'], input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
    /**
     * Sets the strength of both the blur.
     *
     * @member {number}
     * @default 16
     */
    get blur(): number;
    set blur(value: number);
    /**
     * Sets the quality of the blur by modifying the number of passes. More passes means higher
     * quaility bluring but the lower the performance.
     *
     * @member {number}
     * @default 4
     */
    get quality(): number;
    set quality(value: number);
}

export { }
