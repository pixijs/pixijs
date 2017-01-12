import Filter from '../Filter';
import { Matrix } from '../../../../math';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * The SpriteMaskFilter class
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 */
export default class SpriteMaskFilter extends Filter
{
    /**
     * @param {PIXI.Sprite} sprite - the target sprite
     */
    constructor(sprite)
    {
        const maskMatrix = new Matrix();

        super(
            readFileSync(join(__dirname, './spriteMaskFilter.vert'), 'utf8'),
            readFileSync(join(__dirname, './spriteMaskFilter.frag'), 'utf8')
        );

        sprite.renderable = false;

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.FilterManager} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTarget} input - The input render target.
     * @param {PIXI.RenderTarget} output - The target to output to.
     */
    apply(filterManager, input, output)
    {
        const maskSprite = this.maskSprite;

        this.uniforms.mask = maskSprite._texture;
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite);
        this.uniforms.alpha = maskSprite.worldAlpha;

        filterManager.applyFilter(this, input, output);
    }
}
