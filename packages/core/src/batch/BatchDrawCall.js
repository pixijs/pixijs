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
        this.type = 4;

        this.start = 0;
        this.size = 0;

        /**
         * data for uniforms or custom webgl state
         * @member {object}
         */
        this.data = null;
    }
}

export class BatchTextureArray
{
    constructor()
    {
        this.elements = [];
        this.ids = [];
        this.count = 0;
    }

    clear()
    {
        for (let i = 0; i < this.count; i++)
        {
            this.elements[i] = null;
        }
        this.count = 0;
    }
}
