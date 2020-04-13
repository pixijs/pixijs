import { Filter } from '../Filter';
import { Matrix, Point } from '@pixi/math';
import { CLEAR_MODES } from '@pixi/constants';
import vertex from './spriteMaskFilter.vert';
import fragment from './spriteMaskFilter.frag';
import { TextureMatrix } from '../../textures/TextureMatrix';

import type { FilterSystem } from '../FilterSystem';
import type { IMaskTarget } from '../../mask/MaskData';
import type { Texture } from '../../textures/Texture';
import type { RenderTexture } from '../../renderTexture/RenderTexture';

export interface ISpriteMaskTarget extends IMaskTarget
{
    _texture: Texture;
    worldAlpha: number;
    anchor: Point;
}

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
    maskSprite: IMaskTarget;
    maskMatrix: Matrix;
    /**
     * @param {PIXI.Sprite} sprite - the target sprite
     */
    constructor(sprite: IMaskTarget)
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
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void
    {
        const maskSprite = this.maskSprite as ISpriteMaskTarget;
        const tex = maskSprite._texture;

        if (!tex.valid)
        {
            return;
        }
        if (!tex.uvMatrix)
        {
            // margin = 0.0, let it bleed a bit, shader code becomes easier
            // assuming that atlas textures were made with 1-pixel padding
            tex.uvMatrix = new TextureMatrix(tex, 0.0);
        }
        tex.uvMatrix.update();

        this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0.0 : 1.0;
        this.uniforms.mask = tex;
        // get _normalized sprite texture coords_ and convert them to _normalized atlas texture coords_ with `prepend`
        this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite)
            .prepend(tex.uvMatrix.mapCoord);
        this.uniforms.alpha = maskSprite.worldAlpha;
        this.uniforms.maskClamp = tex.uvMatrix.uClampFrame;

        filterManager.applyFilter(this, input, output, clearMode);
    }
}
