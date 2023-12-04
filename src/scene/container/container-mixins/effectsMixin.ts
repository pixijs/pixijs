import { getFilterEffect, returnFilterEffect } from '../../../filters/FilterEffect';
import { MaskEffectManager } from '../../../rendering/mask/MaskEffectManager';

import type { Filter } from '../../../filters/Filter';
import type { FilterEffect } from '../../../filters/FilterEffect';
import type { Rectangle } from '../../../maths/shapes/Rectangle';
import type { Container } from '../Container';
import type { Effect } from '../Effect';

export interface EffectsMixinConstructor
{
    mask?: number | Container;
    filters?: Filter | Filter[];
}
export interface EffectsMixin extends Required<EffectsMixinConstructor>
{
    _mask?: {mask: unknown, effect: Effect};
    _filters?: {
        filters: Filter[],
        effect: FilterEffect
        filterArea?: Rectangle,
    },
    filterArea?: Rectangle,
    effects?: Effect[];
    addEffect(effect: Effect): void;
    removeEffect(effect: Effect): void;
}

export const effectsMixin: Partial<Container> = {
    _mask: null,
    _filters: null,

    /**
     * @todo Needs docs.
     * @memberof scene.Container#
     * @type {Array<Effect>}
     */
    effects: [],

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

        if (!this.isRenderGroupRoot && this.renderGroup)
        {
            this.renderGroup.structureDidChange = true;
        }

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

        if (!this.isRenderGroupRoot && this.renderGroup)
        {
            this.renderGroup.structureDidChange = true;
        }

        this._updateIsSimple();
    },

    set mask(value: number | Container | null)
    {
        this._mask ||= { mask: null, effect: null };

        if (this._mask.mask === value) return;

        if (this._mask.effect)
        {
            this.removeEffect(this._mask.effect);

            MaskEffectManager.returnMaskEffect(this._mask.effect);

            this._mask.effect = null;
        }

        this._mask.mask = value;

        if (value === null || value === undefined) return;

        const effect = MaskEffectManager.getMaskEffect(value);

        this._mask.effect = effect;

        this.addEffect(effect);
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
        return this._mask?.mask;
    },

    set filters(value: Filter | Filter[])
    {
        if (!Array.isArray(value) && value !== null) value = [value];

        // TODO - not massively important, but could optimise here
        // by reusing the same effect.. rather than adding and removing from the pool!
        this._filters ||= { filters: null, effect: null, filterArea: null };

        if (this._filters.filters === value) return;

        if (this._filters.effect)
        {
            this.removeEffect(this._filters.effect);
            returnFilterEffect(this._filters.effect);
            this._filters.effect = null;
        }

        this._filters.filters = value as Filter[];

        if (!value) return;

        const effect = getFilterEffect(value as Filter[], this.filterArea);

        this._filters.effect = effect;

        this.addEffect(effect);
    },

    /**
     * Sets the filters for the displayObject.
     * IMPORTANT: This is a WebGL only feature and will be ignored by the canvas renderer.
     * To remove filters simply set this property to `'null'`.
     * @memberof scene.Container#
     */
    get filters(): Filter[]
    {
        return this._filters?.filters;
    },

    set filterArea(value: Rectangle)
    {
        this._filters ||= { filters: null, effect: null, filterArea: null };

        this._filters.filterArea = value;
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
        return this._filters?.filterArea;
    },

} as Container;
