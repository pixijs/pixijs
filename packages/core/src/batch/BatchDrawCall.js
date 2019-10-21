import { DRAW_MODES } from '@pixi/constants';

/**
 * Used by the batcher to draw batches.
 * Each one of these contains all information required to draw a bound geometry.
 *
 * @class
 * @memberof PIXI
 */
export class BatchDrawCall
{
    constructor()
    {
        this.texArray = null;
        this.blend = 0;
        this.type = DRAW_MODES.TRIANGLES;

        this.start = 0;
        this.size = 0;

        /**
         * data for uniforms or custom webgl state
         * @member {object}
         */
        this.data = null;
    }
}
