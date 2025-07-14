import { FilterEffect } from '../../../filters/FilterEffect';
import { MaskEffectManager } from '../../../rendering/mask/MaskEffectManager';

import type { Filter } from '../../../filters/Filter';
import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { MaskEffect } from '../../../rendering/mask/MaskEffectManager';
import type { Container } from '../Container';
import type { Effect } from '../Effect';

/** @ignore */
export interface EffectsMixinConstructor
{
    /**
     * The mask to apply, which can be a Container or null.
     *
     * If null, it clears the existing mask.
     * @example
     * ```ts
     * // Set a mask
     * sprite.setMask({
     *     mask: graphics,
     *     inverse: false,
     * });
     */
    mask?: Mask;
    setMask?: (options: Partial<MaskOptionsAndMask>) => void;
    /**
     * Sets the filters for the displayObject.
     * Filters are visual effects that can be applied to any display object and its children.
     *
     * > [!IMPORTANT] This is a WebGL/WebGPU only feature and will be ignored by the canvas renderer.
     * @example
     * ```ts
     * new Container({
     *     filters: [new BlurFilter(2), new ColorMatrixFilter()],
     * });
     * ```
     * @see {@link Filter} For filter base class
     */
    filters?: Filter | readonly Filter[];
}

/**
 * The Mask type represents different ways to mask a display object.
 * - A number represents a mask ID.
 * - A Container represents a mask object, such as a Graphics or Sprite.
 * - null indicates that no mask is applied.
 * @example
 * ```ts
 * // Using a Container as a mask
 * const maskContainer: Mask = new Graphics();
 * // Using a mask ID
 * const maskId: Mask = 123;
 * // No mask applied
 * const noMask: Mask = null;
 * ```
 * @category scene
 * @standard
 */
export type Mask = number | Container | null;

/**
 * Options for configuring mask behavior on a display object.
 * @example
 * ```ts
 * // Basic mask inversion
 * sprite.setMask({
 *     mask: graphics,
 *     inverse: true
 * });
 * ```
 * @see {@link Container#setMask} For applying masks with options
 * @see {@link Container#mask} For basic masking
 * @category scene
 * @standard
 */
export interface MaskOptions
{
    /**
     * Whether the mask should be inverted.
     * When true, the masked area becomes transparent and the unmasked area becomes visible.
     * @default false
     * @example
     * ```ts
     * // Invert the mask
     * sprite.setMask({
     *     mask: graphics,
     *     inverse: true
     * });
     * ```
     */
    inverse: boolean;
}

/**
 * MaskOptionsAndMask combines MaskOptions with a Mask for configuring masking behavior.
 * Used when setting up complex masking effects with additional options.
 * @example
 * ```ts
 * sprite.setMask({
 *     mask: graphics,
 *     inverse: true,
 * });
 *
 * // Clear existing mask
 * sprite.setMask({
 *     mask: null,
 *     inverse: false,
 * });
 * ```
 * @category scene
 * @standard
 * @see {@link Container#setMask} For applying masks
 * @see {@link MaskOptions} For base options
 */
export interface MaskOptionsAndMask extends MaskOptions
{
    /**
     * The mask to apply, which can be a Container or null.
     *
     * If null, it clears the existing mask.
     * @example
     * ```ts
     * // Set a mask
     * sprite.setMask({
     *     mask: graphics,
     *     inverse: false,
     * });
     */
    mask: Mask;
}

/**
 * The EffectsMixin interface provides methods and properties for managing effects
 * such as masks and filters on a display object.
 * It allows for adding, removing, and configuring effects, as well as setting a mask for the display object.
 * @category scene
 * @advanced
 */
export interface EffectsMixin extends Required<EffectsMixinConstructor>
{
    /** @private */
    _maskEffect?: MaskEffect;
    /** @private */
    _maskOptions?: MaskOptions;
    /** @private */
    _filterEffect?: FilterEffect,
    /** @private */
    _markStructureAsChanged(): void;

    /**
     * The area the filter is applied to. This is used as an optimization to define a specific region
     * for filter effects instead of calculating the display object bounds each frame.
     *
     * > [!NOTE]
     * > Setting this to a custom Rectangle allows you to define a specific area for filter effects,
     * > which can improve performance by avoiding expensive bounds calculations.
     * @example
     * ```ts
     * // Set specific filter area
     * container.filterArea = new Rectangle(0, 0, 100, 100);
     *
     * // Optimize filter region
     * const screen = app.screen;
     * container.filterArea = new Rectangle(
     *     screen.x,
     *     screen.y,
     *     screen.width,
     *     screen.height
     * );
     * ```
     * @see {@link Container#filters} For applying filters
     * @see {@link Rectangle} For area definition
     */
    filterArea?: Rectangle,
    /**
     * todo Needs docs
     * @advanced
     */
    effects?: Effect[];
    /**
     * todo Needs docs.
     * @param {Effect} effect - The effect to add.
     * @ignore
     */
    addEffect(effect: Effect): void;
    /**
     * todo Needs docs.
     * @param {Effect} effect - The effect to remove.
     * @ignore
     */
    removeEffect(effect: Effect): void;
    /**
     * Used to set mask and control mask options on a display object.
     * Allows for more detailed control over masking behavior compared to the mask property.
     * @example
     * ```ts
     * import { Graphics, Sprite } from 'pixi.js';
     *
     * // Create a circular mask
     * const graphics = new Graphics()
     *     .beginFill(0xFF3300)
     *     .drawCircle(100, 100, 50)
     *     .endFill();
     *
     * // Apply mask with options
     * sprite.setMask({
     *     mask: graphics,
     *     inverse: true, // Create a hole effect
     * });
     *
     * // Clear existing mask
     * sprite.setMask({ mask: null });
     * ```
     * @param {Partial<MaskOptionsAndMask>} options - Configuration options for the mask
     * @see {@link Container#mask} For simple masking
     * @see {@link MaskOptionsAndMask} For full options API
     */
    setMask(options: Partial<MaskOptionsAndMask>): void;
    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an
     * object to the shape of the mask applied to it.
     *
     * > [!IMPORTANT] In PixiJS a regular mask must be a {@link Graphics} or a {@link Sprite} object.
     * > This allows for much faster masking in canvas as it utilities shape clipping.
     * > Furthermore, a mask of an object must be in the subtree of its parent.
     * > Otherwise, `getLocalBounds` may calculate incorrect bounds, which makes the container's width and height wrong.
     *
     * For sprite mask both alpha and red channel are used. Black mask is the same as transparent mask.
     * @example
     * ```ts
     * // Apply mask to sprite
     * const sprite = new Sprite(texture);
     * sprite.mask = graphics;
     *
     * // Remove mask
     * sprite.mask = null;
     * ```
     * @see {@link Graphics} For creating mask shapes
     * @see {@link Sprite} For texture-based masks
     * @see {@link Container#setMask} For advanced mask options
     */
    mask: Mask;
    /**
     * Sets the filters for the displayObject.
     * Filters are visual effects that can be applied to any display object and its children.
     *
     * > [!IMPORTANT] This is a WebGL/WebGPU only feature and will be ignored by the canvas renderer.
     * @example
     * ```ts
     * // Add a single filter
     * sprite.filters = new BlurFilter(2);
     *
     * // Apply multiple filters
     * container.filters = [
     *     new BlurFilter(2),
     *     new ColorMatrixFilter(),
     * ];
     *
     * // Remove filters
     * sprite.filters = null;
     * ```
     * @see {@link Filter} For filter base class
     */
    set filters(value: Filter | Filter[] | null | undefined);
    get filters(): readonly Filter[];
}

/** @internal */
export const effectsMixin: Partial<Container> = {
    _maskEffect: null,
    _maskOptions: {
        inverse: false,
    },
    _filterEffect: null,

    effects: [],

    _markStructureAsChanged()
    {
        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.structureDidChange = true;
        }
    },

    addEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index !== -1) return; // already exists!

        this.effects.push(effect);

        this.effects.sort((a, b) => a.priority - b.priority);

        this._markStructureAsChanged();

        // if (this.renderGroup)
        // {
        //     this.renderGroup.structureDidChange = true;
        // }

        this._updateIsSimple();
    },

    removeEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index === -1) return; // already exists!

        this.effects.splice(index, 1);

        this._markStructureAsChanged();

        this._updateIsSimple();
    },

    set mask(value: Mask)
    {
        const effect = this._maskEffect;

        if (effect?.mask === value) return;

        if (effect)
        {
            this.removeEffect(effect);

            MaskEffectManager.returnMaskEffect(effect);

            this._maskEffect = null;
        }

        if (value === null || value === undefined) return;

        this._maskEffect = MaskEffectManager.getMaskEffect(value);

        this.addEffect(this._maskEffect);
    },
    get mask(): unknown
    {
        return this._maskEffect?.mask;
    },

    setMask(options: Partial<MaskOptionsAndMask>)
    {
        this._maskOptions = {
            ...this._maskOptions,
            ...options,
        };

        if (options.mask)
        {
            this.mask = options.mask;
        }

        this._markStructureAsChanged();
    },

    set filters(value: Filter | Filter[] | null | undefined)
    {
        if (!Array.isArray(value) && value) value = [value];

        const effect = this._filterEffect ||= new FilterEffect();

        // Ignore the Filter type
        value = value as Filter[] | null | undefined;

        const hasFilters = value?.length > 0;
        const hadFilters = effect.filters?.length > 0;

        const didChange = hasFilters !== hadFilters;

        // Clone the filters array so we don't freeze the user-input
        value = Array.isArray(value) ? value.slice(0) : value;

        // Ensure filters are immutable via filters getter
        effect.filters = Object.freeze(value);

        if (didChange)
        {
            if (hasFilters)
            {
                this.addEffect(effect);
            }
            else
            {
                this.removeEffect(effect);

                // sets the empty array...
                effect.filters = value ?? null;
            }
        }
    },
    get filters(): readonly Filter[]
    {
        return this._filterEffect?.filters;
    },

    set filterArea(value: Rectangle)
    {
        this._filterEffect ||= new FilterEffect();

        this._filterEffect.filterArea = value;
    },
    get filterArea(): Rectangle
    {
        return this._filterEffect?.filterArea;
    },

} as Container;
