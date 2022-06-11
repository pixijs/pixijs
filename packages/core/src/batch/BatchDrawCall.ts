import { DRAW_MODES } from '@pixi/constants';

import type { BLEND_MODES } from '@pixi/constants';
import type { BatchTextureArray } from './BatchTextureArray';

/**
 * Used by the batcher to draw batches.
 * Each one of these contains all information required to draw a bound geometry.
 * @memberof PIXI
 */
export class BatchDrawCall
{
    texArray: BatchTextureArray;
    type: DRAW_MODES;
    blend: BLEND_MODES;
    start: number;
    size: number;

    /** Data for uniforms or custom webgl state. */
    data: any;

    constructor()
    {
        this.texArray = null;
        this.blend = 0;
        this.type = DRAW_MODES.TRIANGLES;

        this.start = 0;
        this.size = 0;

        this.data = null;
    }
}
