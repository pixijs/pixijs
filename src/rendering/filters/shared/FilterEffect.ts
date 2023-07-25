import type { Effect } from '../../scene/Effect';
import type { Filter } from './Filter';

export class FilterEffect implements Effect
{
    public filters: Filter[];
    public pipe = 'filter';
    public priority = 1;

    constructor(options?: {filters: Filter[]})
    {
        this.filters = options?.filters;
    }

    public destroy(): void
    {
        for (let i = 0; i < this.filters.length; i++)
        {
            this.filters[i].destroy();
        }

        this.filters = null;
    }
}

const filterEffectsPool: FilterEffect[] = [];

export function getFilterEffect(filters: Filter[])
{
    const filterEffect = filterEffectsPool.pop() || new FilterEffect();

    filterEffect.filters = filters;

    return filterEffect;
}

export function returnFilterEffect(effect: FilterEffect)
{
    effect.filters = null;

    filterEffectsPool.push(effect);
}
