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
import type { Dict } from '@pixi/utils';

export interface ISpriteMaskTarget extends IMaskTarget
{
    _texture: Texture;
    worldAlpha: number;
    anchor: Point;
}

export interface ISpriteMaskFilter extends Filter
{
    maskSprite: IMaskTarget;
}

/**
 * This handles a Sprite acting as a mask, as opposed to a Graphic.
 *
 * WebGL only.
 *
 * @memberof PIXI
 */
export class SpriteMaskFilter extends Filter
{
    /** @private */
    _maskSprite: IMaskTarget;

    /** Mask matrix */
    maskMatrix: Matrix;

    /**
     * @param {PIXI.Sprite} sprite - The target sprite.
     */
    constructor(sprite: IMaskTarget);

    /**
     * @param vertexSrc - The source of the vertex shader.
     * @param fragmentSrc - The source of the fragment shader.
     * @param uniforms - Custom uniforms to use to augment the built-in ones.
     */
    constructor(vertexSrc?: string, fragmentSrc?: string, uniforms?: Dict<any>);

    /** @ignore */
    constructor(vertexSrc?: string | IMaskTarget, fragmentSrc?: string, uniforms?: Dict<any>)
    {
        let sprite = null;

        if (typeof vertexSrc !== 'string' && fragmentSrc === undefined && uniforms === undefined)
        {
            sprite = vertexSrc as IMaskTarget;
            vertexSrc = undefined;
            fragmentSrc = undefined;
            uniforms = undefined;
        }

        super(vertexSrc as string || vertex, fragmentSrc || fragment, uniforms);

        this.maskSprite = sprite;
        this.maskMatrix = new Matrix();
    }

    /**
     * Sprite mask
     *
     * @type {PIXI.DisplayObject}
     */
    get maskSprite(): IMaskTarget
    {
        return this._maskSprite;
    }

    set maskSprite(value: IMaskTarget)
    {
        this._maskSprite = value;

        if (this._maskSprite)
        {
            this._maskSprite.renderable = false;
        }
    }

    /**
     * Applies the filter
     *
     * @param filterManager - The renderer to retrieve the filter from
     * @param input - The input render target.
     * @param output - The target to output to.
     * @param clearMode - Should the output be cleared before rendering to it.
     */
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void
    {
        const maskSprite = this._maskSprite as ISpriteMaskTarget;
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
