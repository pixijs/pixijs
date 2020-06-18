import { Rectangle } from '@pixi/math';

import type { Filter } from './Filter';
import type { IFilterTarget } from './IFilterTarget';
import type { RenderTexture } from '../renderTexture/RenderTexture';

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
        this.filters = [];
    }

    /**
     * clears the state
     * @private
     */
    clear(): void
    {
        this.target = null;
        this.filters = null;
        this.renderTexture = null;
    }
}
