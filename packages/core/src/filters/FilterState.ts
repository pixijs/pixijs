import { Filter } from './Filter';
import { FilterPass } from './FilterPass';
import { IFilterTarget } from './IFilterTarget';
import { RenderTexture } from '@pixi/core';
import { Rectangle } from '@pixi/math';

/**
 * System plugin to the renderer to manage filter states.
 *
 * @class
 * @private
 */
export class FilterState
{
    renderTexture: RenderTexture;
    target: IFilterTarget;
    legacy: boolean;
    resolution: number;
    sourceFrame: Rectangle;
    destinationFrame: Rectangle;
    filters: Array<Filter>;
    filterPasses: Array<FilterPass>;
    passIndex: number;

    constructor()
    {
        this.renderTexture = null;

        /**
         * Target of the filters
         * We store for case when custom filter wants to know the element it was applied on
         * @member {PIXI.DisplayObject}
         * @private
         */
        this.target = null;

        /**
         * Compatibility with PixiJS v4 filters
         * @member {boolean}
         * @default false
         * @private
         */
        this.legacy = false;

        /**
         * Resolution of filters
         * @member {number}
         * @default 1
         * @private
         */
        this.resolution = 1;

        // next three fields are created only for root
        // re-assigned for everything else

        /**
         * Source frame
         * @member {PIXI.Rectangle}
         * @private
         */
        this.sourceFrame = new Rectangle();

        /**
         * Destination frame
         * @member {PIXI.Rectangle}
         * @private
         */
        this.destinationFrame = new Rectangle();

        /**
         * Collection of filters
         * @member {PIXI.Filter[]}
         * @private
         */
        this.filters = null;

        /**
         * Filter passes for each filter.
         * @member {PIXI.FilterPass[]}
         * @readonly
         */
        this.filterPasses = null;

        /**
         * Current filter pass being run.
         * @member {number}
         * @readonly
         */
        this.passIndex = 0;
    }

    /**
     * Current filter's filter-pass object.
     * @member {FilterPass}
     */
    get currentFilterPass(): FilterPass
    {
        return this.filterPasses[this.passIndex];
    }

    /**
     * clears the state
     * @private
     */
    clear(): void
    {
        this.target = null;
        this.filters = null;
        this.filterPasses = null;
        this.passIndex = 0;
        this.renderTexture = null;
    }
}
