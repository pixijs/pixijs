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
    mask?: Mask;
    setMask?: (options: Partial<MaskOptionsAndMask>) => void;
    filters?: Filter | readonly Filter[];
}

/**
 * The Mask type can be a number, a Container, or null.
 * - A number represents a mask ID.
 * - A Container represents a mask object, such as a Graphics or Sprite.
 * - null indicates that no mask is applied.
 * @category scene
 * @standard
 */
export type Mask = number | Container | null;

/**
 * Options for applying a mask.
 * @category scene
 * @standard
 */
export interface MaskOptions
{
    /** Whether the mask should be inverted. */
    inverse: boolean;
}

/**
 * MaskOptionsAndMask combines MaskOptions with a Mask.
 * It includes properties for mask options such as `inverse` and the mask itself.
 * @category scene
 * @standard
 */
export interface MaskOptionsAndMask extends MaskOptions
{
    /** The mask to apply, which can be a Container or null. */
    mask: Mask;
}

/**
 * The EffectsMixin interface provides methods and properties for managing effects
 * such as masks and filters on a display object.
 * It allows for adding, removing, and configuring effects, as well as setting a mask for the display object.
 * @category scene
 * @standard
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
     * The area the filter is applied to. This is used as more of an optimization
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle.
     *
     * Also works as an interaction mask.
     */
    filterArea?: Rectangle,
    /** todo Needs docs. */
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
     * Used to set mask and control mask options.
     * @param {MaskOptionsAndMask} options
     * @example
     * import { Graphics, Sprite } from 'pixi.js';
     *
     * const graphics = new Graphics();
     * graphics.beginFill(0xFF3300);
     * graphics.drawRect(50, 250, 100, 100);
     * graphics.endFill();
     *
     * const sprite = new Sprite(texture);
     * sprite.setMask({
     *     mask: graphics,
     *     inverse: true,
     * });
     */
    setMask(options: Partial<MaskOptionsAndMask>): void;
    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an
     * object to the shape of the mask applied to it. In PixiJS a regular mask must be a
     * {@link Graphics} or a {@link Sprite} object. This allows for much faster masking in canvas as it
     * utilities shape clipping. Furthermore, a mask of an object must be in the subtree of its parent.
     * Otherwise, `getLocalBounds` may calculate incorrect bounds, which makes the container's width and height wrong.
     * To remove a mask, set this property to `null`.
     *
     * For sprite mask both alpha and red channel are used. Black mask is the same as transparent mask.
     * @example
     * import { Graphics, Sprite } from 'pixi.js';
     *
     * const graphics = new Graphics();
     * graphics.beginFill(0xFF3300);
     * graphics.drawRect(50, 250, 100, 100);
     * graphics.endFill();
     *
     * const sprite = new Sprite(texture);
     * sprite.mask = graphics;
     */
    mask: Mask;
    /**
     * Sets the filters for the displayObject.
     * IMPORTANT: This is a WebGL/WebGPU only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to `'null'`.
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
