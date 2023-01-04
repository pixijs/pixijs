import { utils } from '@pixi/core';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';

/** @deprecated */
const filters = {
    /** @deprecated */
    BlurFilter,
    /** @deprecated */
    BlurFilterPass,
    /** @deprecated */
    ColorMatrixFilter,
    /** @deprecated */
    DisplacementFilter,
    /** @deprecated */
    FXAAFilter,
    /** @deprecated */
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
