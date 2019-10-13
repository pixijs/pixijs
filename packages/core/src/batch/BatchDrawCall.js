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
        this.size = 0;
    }

    calculateBinds(boundTextures, batchId, maxTextures)
    {
        const { elements, ids, count } = this;
        let j = 0;

        for (let i = 0; i < count; i++)
        {
            const tex = elements[i];
            const loc = tex._batchLocation;

            if (loc >= 0 && loc < maxTextures
                && boundTextures[loc] === tex)
            {
                ids[i] = loc;
                continue;
            }

            while (j < maxTextures)
            {
                if (boundTextures[j]._batchEnabled === batchId
                    && boundTextures[j]._batchLocation === j)
                {
                    j++;
                    continue;
                }

                ids[i] = j;
                tex._batchLocation = j;
                boundTextures[j] = tex;
                break;
            }
        }
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
