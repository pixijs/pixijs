import ArrayResource from './ArrayResource';
import { TARGETS } from '@pixi/constants';

/**
 * Resource for a CubeTexture which contains six resources.
 *
 * @class
 * @extends PIXI.resources.ArrayResource
 * @memberof PIXI.resources
 * @param {Array<string|PIXI.resource.Resource>} [source] Collection of URLs or resoures
 *        to use as the sides of the cube.
 */
export default class CubeResource extends ArrayResource
{
    constructor(source, options)
    {
        if (source.length !== CubeResource.SIDES)
        {
            throw new Error(`Invalid cube length. Got ${source.length}, expected 6`);
        }

        super(source, options);
    }

    /**
     * Add binding
     * @override
     * @param {PIXI.BaseTexture} baseTexture - parent base texture
     */
    bind(baseTexture)
    {
        super.bind(baseTexture);

        baseTexture.target = TARGETS.TEXTURE_CUBE_MAP;
    }

    /**
     * Uploade the resource
     */
    upload(renderer, baseTexture, glTexture)
    {
        const dirty = this.itemDirtyIds;

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            const side = this.items[i];

            if (dirty[i] < side.dirtyId)
            {
                dirty[i] = side.dirtyId;
                if (side.valid)
                {
                    side.resource.upload(renderer, side, glTexture);
                }
                else
                {
                    // TODO: upload zero buffer
                }
            }
        }

        return true;
    }
}

/**
 * Number of texture sides to store for CubeResources
 * @name PIXI.resources.CubeResource.SIDES
 * @static
 * @member {number}
 * @default 6
 */
CubeResource.SIDES = 6;
