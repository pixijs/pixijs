import { FilterEffect } from '../../../filters/FilterEffect';
import { MaskEffectManager } from '../../../rendering/mask/MaskEffectManager';

import type { Filter } from '../../../filters/Filter';
import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { MaskEffect } from '../../../rendering/mask/MaskEffectManager';
import type { Container } from '../Container';
import type { Effect } from '../Effect';

export interface EffectsMixinConstructor
{
    mask?: Mask;
    setMask?: (options: Partial<MaskOptionsAndMask>) => void;
    filters?: Filter | Filter[];
}

export type Mask = number | Container | null;

export interface MaskOptions
{
    inverse: boolean;
}

export interface MaskOptionsAndMask extends MaskOptions
{
    mask: Mask;
}

export interface EffectsMixin extends Required<EffectsMixinConstructor>
{
    _maskEffect?: MaskEffect;
    _maskOptions?: MaskOptions;
    _filterEffect?: FilterEffect,

    filterArea?: Rectangle,
    effects?: Effect[];

    _markStructureAsChanged(): void;
    addEffect(effect: Effect): void;
    removeEffect(effect: Effect): void;
}

export const effectsMixin: Partial<Container> = {
    _maskEffect: null,
    _maskOptions: {
        inverse: false,
    },
    _filterEffect: null,

    /**
     * @todo Needs docs.
     * @memberof scene.Container#
     * @type {Array<Effect>}
     */
    effects: [],

    _markStructureAsChanged()
    {
        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (renderGroup)
        {
            renderGroup.structureDidChange = true;
        }
    },
    /**
     * @todo Needs docs.
     * @param effect - The effect to add.
     * @memberof scene.Container#
     * @ignore
     */
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
    /**
     * @todo Needs docs.
     * @param effect - The effect to remove.
     * @memberof scene.Container#
     * @ignore
     */
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

    /**
     * Used to set mask and control mask options.
     * @param options
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
     * @memberof scene.Container#
     */
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
     * @memberof scene.Container#
     */
    get mask(): unknown
    {
        return this._maskEffect?.mask;
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

    /**
     * Sets the filters for the displayObject.
     * IMPORTANT: This is a WebGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to `'null'`.
     * @memberof scene.Container#
     */
    get filters(): readonly Filter[]
    {
        return this._filterEffect?.filters;
    },

    set filterArea(value: Rectangle)
    {
        this._filterEffect ||= new FilterEffect();

        this._filterEffect.filterArea = value;
    },

    /**
     * The area the filter is applied to. This is used as more of an optimization
     * rather than figuring out the dimensions of the displayObject each frame you can set this rectangle.
     *
     * Also works as an interaction mask.
     * @memberof scene.Container#
     */
    get filterArea(): Rectangle
    {
        return this._filterEffect?.filterArea;
    },

} as Container;
