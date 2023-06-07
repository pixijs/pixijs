import type { Effect } from '../scene/Effect';
import type { Filter } from './Filter';

export class FilterEffect implements Effect
{
    filters: Filter[];
    pipe = 'filter';
    priority = 1;

    constructor(options?: {filters: Filter[]})
    {
        this.filters = options?.filters;
    }

    // addBounds(_bounds: Bounds): void
    // {
    //     // TODO do we take into account padding?
    // }

    // addLocalBounds(_bounds: Bounds, _localRoot: Container<any>): void
    // {
    //     // nothing?? :D
    //     // lets see if this need to exist in time!
    // }
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
