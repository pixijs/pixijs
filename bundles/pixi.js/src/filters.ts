import { utils } from '@pixi/core';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';

/**
 * Filters namespace has been removed. All filters are now available directly from the root of the package.
 * @namespace PIXI.filters
 * @deprecated
 */
const filters = {
    /**
     * @class
     * @memberof PIXI.filters
     * @deprecated since 7.1.0
     * @see PIXI.BlurFilter
     */
    BlurFilter,
    /**
     * @class
     * @memberof PIXI.filters
     * @deprecated since 7.1.0
     * @see PIXI.BlurFilterPass
     */
    BlurFilterPass,
    /**
     * @class
     * @memberof PIXI.filters
     * @deprecated since 7.1.0
     * @see PIXI.ColorMatrixFilter
     */
    ColorMatrixFilter,
    /**
     * @class
     * @memberof PIXI.filters
     * @deprecated since 7.1.0
     * @see PIXI.DisplacementFilter
     */
    DisplacementFilter,
    /**
     * @class
     * @memberof PIXI.filters
     * @deprecated since 7.1.0
     * @see PIXI.FXAAFilter
     */
    FXAAFilter,
    /**
     * @class
     * @memberof PIXI.filters
     * @deprecated since 7.1.0
     * @see PIXI.NoiseFilter
     */
    NoiseFilter,
};

for (const i in filters)
{
    const key = i as keyof typeof filters;

    Object.defineProperty(filters, key, {
        get()
        {
            utils.deprecation('7.1.0', `filters.${key} has moved to ${key}`);

            return filters[key];
        },
    });
}

export { filters };
