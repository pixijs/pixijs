import { Filter } from '../Filter';
import { Matrix } from '@pixi/math';
import vertex from './spriteMaskFilter.vert';
import fragment from './spriteMaskFilter.frag';
import { TextureMatrix } from '../../textures/TextureMatrix';

/**
 * This handles a Sprite acting as a mask, as opposed to a Graphic.
 *
 * WebGL only.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI
 */
export class SpriteMaskFilter extends Filter
{
    /**
     * @param {PIXI.Sprite} sprite - the target sprite
     */
    constructor(sprite)
    {
        const maskMatrix = new Matrix();

        super(vertex, fragment);

        sprite.renderable = false;

        /**
         * Sprite mask
         * @member {PIXI.Sprite}
         */
        this.maskSprite = sprite;

        /**
         * Mask matrix
         * @member {PIXI.Matrix}
         */
        this.maskMatrix = maskMatrix;
    }

    /**
     * Applies the filter
     *
     * @param {PIXI.systems.FilterSystem} filterManager - The renderer to retrieve the filter from
     * @param {PIXI.RenderTexture} input - The input render target.
     * @param {PIXI.RenderTexture} output - The target to output to.
     * @param {PIXI.CLEAR_MODES} clearMode - Should the output be cleared before rendering to it.
     */
    apply(filterManager, input, output, clearMode)
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

        this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0.0 : 1.0;
        this.uniforms.mask = tex;
        // get _normalized sprite texture coords_ and convert them to _normalized atlas texture coords_ with `prepend`
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite)
            .prepend(tex.transform.mapCoord);
        this.uniforms.alpha = maskSprite.worldAlpha;
        this.uniforms.maskClamp = tex.transform.uClampFrame;

        filterManager.applyFilter(this, input, output, clearMode);
    }
}
