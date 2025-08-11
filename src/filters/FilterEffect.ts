import type { Rectangle } from '../maths/shapes/Rectangle';
import type { Effect } from '../scene/container/Effect';
import type { Filter } from './Filter';

const typeSymbol = Symbol.for('pixijs.FilterEffect');

/**
 * A filter effect is an effect that can be applied to a container that involves applying special pixel effects
 * to that container as it is rendered. Used internally when the filters property is modified on a container.
 * @internal
 */
export class FilterEffect implements Effect
{
    /**
     * Type symbol used to identify instances of FilterEffect.
     * @internal
     */
    public readonly [typeSymbol] = true;

    /**
     * Checks if the given object is a FilterEffect.
     * @param obj - The object to check.
     * @returns True if the object is a FilterEffect, false otherwise.
     */
    public static isFilterEffect(obj: any): obj is FilterEffect
    {
        return !!obj && !!obj[typeSymbol];
    }

    /** read only filters array - to modify, set it again! */
    public filters: readonly Filter[];
    /**
     * If specified, rather than calculating the bounds of the container that the filter
     * will apply to, we use this rect instead. This is a local rect - so will have the containers transform
     * applied to it
     */
    public filterArea?: Rectangle;

    /** the pipe that knows how to handle this effect */
    public pipe = 'filter';
    /** the priority of this effect */
    public priority = 1;

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
