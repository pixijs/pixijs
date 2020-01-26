import { Rectangle } from '@pixi/math';

/**
 * Data object to store relevant filter frames for a filter.
 *
 * @namespace PIXI
 * @class
 * @private
 */
export class FilterPass
{
    inputFrame: Rectangle;
    targetInFrame: Rectangle;
    outputFrame: Rectangle;
    targetOutFrame: Rectangle;

    constructor(inputFrame: Rectangle = null, targetInFrame: Rectangle = null,
        outputFrame: Rectangle = null, targetOutFrame: Rectangle = null)
    {
        this.inputFrame = inputFrame;
        this.targetInFrame = targetInFrame;
        this.outputFrame = outputFrame;
        this.targetOutFrame = targetOutFrame;
    }

    reset(): void
    {
        /**
         * The filter-frame of the input texture.
         * @member {PIXI.Rectangle}
         */
        this.inputFrame = null;

        /**
         * The frame inside the input-frame on which the filter is to be applied.
         * @member {PIXI.Rectangle}
         */
        this.targetInFrame = null;

        /**
         * The filter-frame of the output render-texture.
         * @member {PIXI.Rectangle}
         */
        this.outputFrame = null;

        /**
         * The frame inside the output-frame in which the filter's results will be
         * written. Anything outside this will be copied from the input texture.
         * @member {PIXI.Rectangle}
         */
        this.targetOutFrame = null;
    }
}
