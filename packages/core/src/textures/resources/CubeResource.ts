import { ArrayResource } from './ArrayResource';
import { Resource } from './Resource';
import { TARGETS } from '@pixi/constants';

import { BaseTexture, Renderer, GLTexture, ImageSource } from '@pixi/core';

/**
 * Resource for a CubeTexture which contains six resources.
 *
 * @class
 * @extends PIXI.resources.ArrayResource
 * @memberof PIXI.resources
 * @param {Array<string|PIXI.resources.Resource>} [source] Collection of URLs or resources
 *        to use as the sides of the cube.
 * @param {object} [options] - ImageResource options
 * @param {number} [options.width] - Width of resource
 * @param {number} [options.height] - Height of resource
 */
export class CubeResource extends ArrayResource
{
    items: Array<BaseTexture>;

    constructor(source: Array<string|Resource>, options?: any)
    {
        options = options || {};

        super(source, options);

        if (this.length !== CubeResource.SIDES)
        {
            throw new Error(`Invalid length. Got ${this.length}, expected 6`);
        }

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            this.items[i].target = TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        }

        if (options.autoLoad !== false)
        {
            this.load();
        }
    }

    /**
     * Add binding
     *
     * @override
     * @param {PIXI.BaseTexture} baseTexture - parent base texture
     */
    bind(baseTexture: BaseTexture)
    {
        super.bind(baseTexture);

        baseTexture.target = TARGETS.TEXTURE_CUBE_MAP;
    }

    /**
     * Upload the resource
     *
     * @returns {boolean} true is success
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture, source?: ImageSource): boolean
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

    /**
     * Number of texture sides to store for CubeResources
     *
     * @name PIXI.resources.CubeResource.SIDES
     * @static
     * @member {number}
     * @default 6
     */
    static SIDES = 6;
}
