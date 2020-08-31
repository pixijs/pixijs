import type { CLEAR_MODES } from '@pixi/constants';
import { Filter } from '@pixi/core';
import type { ISpriteMaskTarget } from '@pixi/core';
import { Matrix } from '@pixi/math';
import { Point } from '@pixi/math';
import type { RenderTexture } from '@pixi/core';
import type { systems } from '@pixi/core';
import type { Texture } from '@pixi/core';

/**
 * The DisplacementFilter class uses the pixel values from the specified texture
 * (called the displacement map) to perform a displacement of an object.
 *
 * You can use this filter to apply all manor of crazy warping effects.
 * Currently the `r` property of the texture is used to offset the `x`
 * and the `g` property of the texture is used to offset the `y`.
 *
 * The way it works is it uses the values of the displacement map to look up the
 * correct pixels to output. This means it's not technically moving the original.
 * Instead, it's starting at the output and asking "which pixel from the original goes here".
 * For example, if a displacement map pixel has `red = 1` and the filter scale is `20`,
 * this filter will output the pixel approximately 20 pixels to the right of the original.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
export declare class DisplacementFilter extends Filter {
    maskSprite: ISpriteMaskTarget;
    maskMatrix: Matrix;
    scale: Point;
    /**
     * @param {PIXI.Sprite} sprite - The sprite used for the displacement map. (make sure its added to the scene!)
     * @param {number} [scale] - The scale of the displacement
     */
    constructor(sprite: ISpriteMaskTarget, scale: number);
    /**
     * Applies the filter.
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The manager.
     * @param {PIXI.RenderTexture} input - The input target.
     * @param {PIXI.RenderTexture} output - The output target.
     * @param {PIXI.CLEAR_MODES} clearMode - clearMode.
     */
    apply(filterManager: systems['FilterSystem'], input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
    /**
     * The texture used for the displacement map. Must be power of 2 sized texture.
     *
     * @member {PIXI.Texture}
     */
    get map(): Texture;
    set map(value: Texture);
}

export { }
