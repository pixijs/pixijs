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
    effects?: Effect[];
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
    addEffect(effect: Effect): void;
    removeEffect(effect: Effect): void;
}

export const effectsMixin: Partial<Container> = {
    _mask: null,
    _filters: null,
    effects: [],

    addEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index !== -1) return; // already exists!

        this.effects.push(effect);

        this.effects.sort((a, b) => a.priority - b.priority);

        if (!this.isLayerRoot && this.layerGroup)
        {
            this.layerGroup.structureDidChange = true;
        }

        this._updateIsSimple();
    },
    removeEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index === -1) return; // already exists!

        this.effects.splice(index, 1);

        if (!this.isLayerRoot && this.layerGroup)
        {
            this.layerGroup.structureDidChange = true;
        }

        this._updateIsSimple();
    },

    set mask(value: number | Container)
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

    get filters(): Filter[]
    {
        return this._filters?.filters;
    },

    set filterArea(value: Rectangle)
    {
        this._filters ||= { filters: null, effect: null, filterArea: null };

        this._filters.filterArea = value;
    },

    get filterArea(): Rectangle
    {
        return this._filters?.filterArea;
    },

} as Container;
