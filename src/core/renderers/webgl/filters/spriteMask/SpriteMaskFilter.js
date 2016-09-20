import Filter from '../Filter';
import math from '../../../../math';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify');

/**
 * The SpriteMaskFilter class
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 * @param sprite {PIXI.Sprite} the target sprite
 */
class SpriteMaskFilter extends Filter
{
    constructor(sprite)
    {
        const maskMatrix = new math.Matrix();

        super(
            glslify('./spriteMaskFilter.vert'),
            glslify('./spriteMaskFilter.frag')
        );

        sprite.renderable = false;

        this.maskSprite = sprite;
        this.maskMatrix = maskMatrix;
    }

    /**
     * Applies the filter
     *
     * @param filterManager {PIXI.FilterManager} The renderer to retrieve the filter from
     * @param input {PIXI.RenderTarget}
     * @param output {PIXI.RenderTarget}
     */
    apply(filterManager, input, output)
    {
        const maskSprite = this.maskSprite;

        this.uniforms.mask = maskSprite._texture;
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite );
        this.uniforms.alpha = maskSprite.worldAlpha;

        filterManager.applyFilter(this, input, output);
    }
}

export default SpriteMaskFilter;
