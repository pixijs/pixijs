import type { Rectangle } from '../maths/shapes/Rectangle';
import type { Effect } from '../scene/container/Effect';
import type { Filter } from './Filter';

/**
 * A filter effect is an effect that can be applied to a container that involves applying special pixel effects
 * to that container as it is rendered. Used internally when the filters property is modified on a container
 */
export class FilterEffect implements Effect
{
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
