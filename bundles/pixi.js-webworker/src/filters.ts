import { utils } from '@pixi/core';
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';

/** @deprecated */
const filters = {
    /** @deprecated */
    AlphaFilter,
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

Object.entries(filters).forEach(([key, FilterClass]) =>
{
    Object.defineProperty(filters, key, {
        get()
        {
            if (process.env.DEBUG)
            {
                utils.deprecation('7.1.0', `filters.${key} has moved to ${key}`);
            }

            return FilterClass;
        },
    });
});

export { filters };
