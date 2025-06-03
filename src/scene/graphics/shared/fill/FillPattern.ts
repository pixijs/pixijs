import { Matrix } from '../../../../maths/matrix/Matrix';
import { uid } from '../../../../utils/data/uid';

import type { WRAP_MODE } from '../../../../rendering/renderers/shared/texture/const';
import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';

/**
 * Defines the repetition modes for fill patterns.
 *
 * - `repeat`: The pattern repeats in both directions.
 * - `repeat-x`: The pattern repeats horizontally only.
 * - `repeat-y`: The pattern repeats vertically only.
 * - `no-repeat`: The pattern does not repeat.
 * @category scene
 * @standard
 */
export type PatternRepetition = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

const repetitionMap = {
    repeat: {
        addressModeU: 'repeat',
        addressModeV: 'repeat',
    },
    'repeat-x': {
        addressModeU: 'repeat',
        addressModeV: 'clamp-to-edge',
    },
    'repeat-y': {
        addressModeU: 'clamp-to-edge',
        addressModeV: 'repeat',
    },
    'no-repeat': {
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
    },
};

/**
 * A class that represents a fill pattern for use in Text and Graphics fills.
 * It allows for textures to be used as patterns, with optional repetition modes.
 * @category scene
 * @standard
 * @example
 * const txt = await Assets.load('https://pixijs.com/assets/bg_scene_rotate.jpg');
 * const pat = new FillPattern(txt, 'repeat');
 *
 * const textPattern = new Text({
 *     text: 'PixiJS',
 *     style: {
 *         fontSize: 36,
 *         fill: 0xffffff,
 *         stroke: { fill: pat, width: 10 },
 *     },
 * });
 *
 * textPattern.y = (textGradient.height);
 */
export class FillPattern implements CanvasPattern
{
    /**
     * unique id for this fill pattern
     * @internal
     */
    public readonly uid: number = uid('fillPattern');
    /** Internal texture used to render the gradient */
    public texture: Texture;
    /** The transform matrix applied to the pattern */
    public transform = new Matrix();

    private _styleKey: string | null = null;

    constructor(texture: Texture, repetition?: PatternRepetition)
    {
        this.texture = texture;

        this.transform.scale(
            1 / texture.frame.width,
            1 / texture.frame.height
        );

        if (repetition)
        {
            texture.source.style.addressModeU = repetitionMap[repetition].addressModeU as WRAP_MODE;
            texture.source.style.addressModeV = repetitionMap[repetition].addressModeV as WRAP_MODE;
        }
    }

    /**
     * Sets the transform for the pattern
     * @param transform - The transform matrix to apply to the pattern.
     * If not provided, the pattern will use the default transform.
     */
    public setTransform(transform?: Matrix): void
    {
        const texture = this.texture;

        this.transform.copyFrom(transform);
        this.transform.invert();
        //  transform.scale
        this.transform.scale(
            1 / texture.frame.width,
            1 / texture.frame.height
        );

        this._styleKey = null;
    }

    /**
     * Gets a unique key representing the current state of the pattern.
     * Used internally for caching.
     * @returns Unique string key
     */
    public get styleKey(): string
    {
        if (this._styleKey) return this._styleKey;

        this._styleKey = `fill-pattern-${this.uid}-${this.texture.uid}-${this.transform.toArray().join('-')}`;

        return this._styleKey;
    }
}
