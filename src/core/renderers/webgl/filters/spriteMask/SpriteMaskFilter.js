import Filter from '../Filter';
import { Matrix } from '../../../../math';
import { readFileSync } from 'fs';
import { join } from 'path';
import { default as TextureMatrix } from '../../../../textures/TextureMatrix';

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
        const tex = this.maskSprite.texture;

        if (!tex.valid)
        {
            return;
        }
        if (!tex.transform)
        {
            // margin = 0.0, let it bleed a bit, shader code becomes easier
            // assuming that atlas textures were made with 1-pixel padding
            tex.transform = new TextureMatrix(tex, 0.0);
        }
        tex.transform.update();

        this.uniforms.mask = tex;
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite)
            .prepend(tex.transform.mapCoord);
        this.uniforms.alpha = maskSprite.worldAlpha;
        this.uniforms.maskClamp = tex.transform.uClampFrame;

        filterManager.applyFilter(this, input, output);
    }
}
