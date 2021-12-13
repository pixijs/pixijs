import { Matrix, Rectangle } from '@pixi/math';
import { MSAA_QUALITY } from '@pixi/constants';

import type { Filter } from './Filter';
import type { IFilterTarget } from './IFilterTarget';
import type { RenderTexture } from '../renderTexture/RenderTexture';

/**
 * System plugin to the renderer to manage filter states.
 *
 * @ignore
 */
export class FilterState
{
    renderTexture: RenderTexture;

    /**
     * Target of the filters
     * We store for case when custom filter wants to know the element it was applied on
     * @member {PIXI.DisplayObject}
     */
    target: IFilterTarget;

    /**
     * Compatibility with PixiJS v4 filters
     * @default false
     */
    legacy: boolean;

    /**
     * Resolution of filters
     * @default 1
     */
    resolution: number;

    /**
     * Number of samples
     * @default MSAA_QUALITY.NONE
     */
    multisample: MSAA_QUALITY;

    /** Source frame. */
    sourceFrame: Rectangle;

    /** Destination frame. */
    destinationFrame: Rectangle;

    /** Original render-target source frame. */
    bindingSourceFrame: Rectangle;

    /** Original render-target destination frame. */
    bindingDestinationFrame: Rectangle;

    /** Collection of filters. */
    filters: Array<Filter>;

    /** Projection system transform saved by link. */
    transform: Matrix;

    constructor()
    {
        this.renderTexture = null;

        this.target = null;
        this.legacy = false;
        this.resolution = 1;
        this.multisample = MSAA_QUALITY.NONE;

        // next three fields are created only for root
        // re-assigned for everything else

        this.sourceFrame = new Rectangle();
        this.destinationFrame = new Rectangle();
        this.bindingSourceFrame = new Rectangle();
        this.bindingDestinationFrame = new Rectangle();
        this.filters = [];
        this.transform = null;
    }

    /** Clears the state */
    clear(): void
    {
        this.target = null;
        this.filters = null;
        this.renderTexture = null;
    }
}
