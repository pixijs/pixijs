import { Matrix } from '../../../../maths/matrix/Matrix';
import { uid } from '../../../../utils/data/uid';

import type { WRAP_MODE } from '../../../../rendering/renderers/shared/texture/const';
import type { Texture } from '../../../../rendering/renderers/shared/texture/Texture';
import type { TextureSpace } from '../FillTypes';

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

/**
 * Options for creating a {@link FillPattern}.
 * A fill pattern tiles a {@link Texture} to fill shapes or text. Patterns are
 * commonly used for repeating backgrounds, decorative fills, and shape-fitted
 * textures.
 * @category scene
 * @standard
 * @example
 * ```ts
 * // Tiled background — repeats continuously across world space, so adjacent
 * // shapes share the same tiling grid.
 * const bricks = new FillPattern({
 *     texture: await Assets.load('bricks.png'),
 *     repetition: 'repeat',
 * });
 *
 * // One tile fitted to each shape — useful for shape-fitted decoration.
 * const fitted = new FillPattern({
 *     texture: await Assets.load('bunny.png'),
 *     repetition: 'repeat',
 *     textureSpace: 'local',
 * });
 *
 * // Tile only along the x-axis; clamp vertically.
 * const stripes = new FillPattern({
 *     texture: await Assets.load('stripe.png'),
 *     repetition: 'repeat-x',
 * });
 *
 * // Single image, no tiling — clamp on both axes.
 * const logo = new FillPattern({
 *     texture: await Assets.load('logo.png'),
 *     repetition: 'no-repeat',
 * });
 * ```
 */
export interface FillPatternOptions
{
    /**
     * The texture to use as the pattern source. The texture is tiled across
     * the filled area according to {@link FillPatternOptions.repetition} and
     * mapped to shapes according to {@link FillPatternOptions.textureSpace}.
     */
    texture: Texture;
    /**
     * How the pattern repeats across the filled area. If omitted, the texture's
     * existing wrap mode is used.
     * - `'repeat'`: tile in both X and Y.
     * - `'repeat-x'`: tile horizontally; clamp vertically.
     * - `'repeat-y'`: tile vertically; clamp horizontally.
     * - `'no-repeat'`: do not tile; clamp on both axes.
     */
    repetition?: PatternRepetition;
    /**
     * Whether pattern coordinates are evaluated in local or global space.
     * - `'global'` (default): the pattern tiles continuously across world
     *   space, so adjacent shapes share the same tiling grid. Best for
     *   backgrounds and seamless textures.
     * - `'local'`: the pattern is mapped to each shape's bounds, so one tile
     *   fits the shape. Combine with {@link FillPattern.setTransform} to
     *   subdivide a shape into a tile grid.
     * @default 'global'
     */
    textureSpace?: TextureSpace;
}

function isFillPatternOptions(value: Texture | FillPatternOptions): value is FillPatternOptions
{
    return (value as FillPatternOptions).texture !== undefined;
}

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
 *
 * Patterns default to {@link FillStyle.textureSpace `textureSpace: 'global'`},
 * meaning tiles repeat continuously across world space and adjacent shapes share
 * the same tiling grid. Pass `textureSpace: 'local'` to map a single tile to each
 * shape's bounds instead.
 * @category scene
 * @standard
 * @example
 * ```ts
 * const txt = await Assets.load('https://pixijs.com/assets/bg_scene_rotate.jpg');
 *
 * // global tiling (default) — pattern continues across shapes
 * const pat = new FillPattern({ texture: txt, repetition: 'repeat' });
 *
 * // legacy positional form is still supported
 * const pat2 = new FillPattern(txt, 'repeat');
 *
 * const textPattern = new Text({
 *     text: 'PixiJS',
 *     style: {
 *         fontSize: 36,
 *         fill: 0xffffff,
 *         stroke: { fill: pat, width: 10 },
 *     },
 * });
 * ```
 */
export class FillPattern implements CanvasPattern
{
    /**
     * unique id for this fill pattern
     * @internal
     */
    public readonly uid: number = uid('fillPattern');
    /**
     * Internal tick counter to track changes in the pattern.
     * This is used to invalidate the pattern when the texture or transform changes.
     * @internal
     */
    public _tick: number = 0;
    /** @internal */
    public _texture: Texture;
    /** The transform matrix applied to the pattern */
    public transform = new Matrix();
    /**
     * Whether pattern coordinates are evaluated in local or global space.
     * @default 'global'
     */
    public textureSpace: TextureSpace;

    /**
     * Creates a new fill pattern.
     * @param options - The options for the fill pattern.
     */
    constructor(options: FillPatternOptions);
    /**
     * Creates a new fill pattern from a texture and optional repetition mode.
     * @param texture - The texture to tile.
     * @param repetition - How the pattern should repeat.
     */
    constructor(texture: Texture, repetition?: PatternRepetition);
    constructor(textureOrOptions: Texture | FillPatternOptions, repetition?: PatternRepetition)
    {
        const options: FillPatternOptions = isFillPatternOptions(textureOrOptions)
            ? textureOrOptions
            : { texture: textureOrOptions, repetition };

        this.texture = options.texture;
        this.textureSpace = options.textureSpace ?? 'global';

        const rep = options.repetition;

        if (rep)
        {
            this.texture.source.style.addressModeU = repetitionMap[rep].addressModeU as WRAP_MODE;
            this.texture.source.style.addressModeV = repetitionMap[rep].addressModeV as WRAP_MODE;
        }
    }

    /**
     * Sets the transform for the pattern
     * @param transform - The transform matrix to apply to the pattern.
     * If not provided, the pattern will use the default transform.
     */
    public setTransform(transform?: Matrix): void
    {
        if (transform)
        {
            if (this.transform.equals(transform)) return;
            this.transform.copyFrom(transform);
        }
        else
        {
            if (this.transform.isIdentity()) return;
            this.transform.identity();
        }

        this._tick++;
    }

    /** Internal texture used to render the gradient */
    public get texture()
    {
        return this._texture;
    }
    public set texture(value: Texture)
    {
        if (this._texture === value) return;

        this._texture = value;
        this._tick++;
    }

    /**
     * Returns a unique key for this instance.
     * This key is used for caching.
     * @returns {string} Unique key for the instance
     */
    public get styleKey(): string
    {
        return `fill-pattern-${this.uid}-${this._tick}`;
    }

    /** Destroys the fill pattern, releasing resources. This will also destroy the internal texture. */
    public destroy(): void
    {
        this.texture.destroy(true);
        this.texture = null;
    }
}
