import { getFilterEffect, returnFilterEffect } from '../../../filters/FilterEffect';
import { MaskEffectManager } from '../../../rendering/mask/MaskEffectManager';

import type { Filter } from '../../../filters/Filter';
import type { FilterEffect } from '../../../filters/FilterEffect';
import type { Container } from '../Container';
import type { Effect } from '../Effect';

export interface EffectsMixin
{
    _mask?: {mask: unknown, effect: Effect};
    _filters?: {filters: Filter[], effect: FilterEffect};

    mask: number | Container;
    filters: Filter[];
}

export const effectsMixin: Partial<Container> = {
    _mask: null,
    _filters: null,

    set mask(value: unknown)
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
        this._filters ||= { filters: null, effect: null };

        if (this._filters.filters === value) return;

        if (this._filters.effect)
        {
            this.removeEffect(this._filters.effect);
            returnFilterEffect(this._filters.effect);
            this._filters.effect = null;
        }

        this._filters.filters = value as Filter[];

        if (!value) return;

        const effect = getFilterEffect(value as Filter[]);

        this._filters.effect = effect;

        this.addEffect(effect);
    },

    get filters(): Filter[]
    {
        return this._filters?.filters;
    }
} as Container;
