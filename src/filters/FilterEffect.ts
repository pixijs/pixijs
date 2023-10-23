import type { Rectangle } from '../maths/shapes/Rectangle';
import type { Effect } from '../scene/container/Effect';
import type { Filter } from './Filter';

export class FilterEffect implements Effect
{
    public filters: Filter[];
    public filterArea?: Rectangle;

    public pipe = 'filter';
    public priority = 1;

    constructor(options?: {filters: Filter[], filterArea?: Rectangle})
    {
        this.filters = options?.filters;
        this.filterArea = options?.filterArea;
    }

    public destroy(): void
    {
        for (let i = 0; i < this.filters.length; i++)
        {
            this.filters[i].destroy();
        }

        this.filters = null;
        this.filterArea = null;
    }
}

const filterEffectsPool: FilterEffect[] = [];

export function getFilterEffect(filters: Filter[], filterArea?: Rectangle)
{
    const filterEffect = filterEffectsPool.pop() || new FilterEffect();

    filterEffect.filters = filters;
    filterEffect.filterArea = filterArea;

    return filterEffect;
}

export function returnFilterEffect(effect: FilterEffect)
{
    effect.filters = null;

    filterEffectsPool.push(effect);
}
