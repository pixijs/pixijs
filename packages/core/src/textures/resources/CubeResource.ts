import { ArrayResource } from './ArrayResource';
import { TARGETS } from '@pixi/constants';

import type { Resource } from './Resource';
import type { ISize } from '@pixi/math';
import type { ArrayFixed } from '@pixi/utils';
import type { BaseTexture } from '../BaseTexture';
import type { Renderer } from '../../Renderer';
import type { GLTexture } from '../GLTexture';

/**
 * Constructor options for CubeResource
 */
export interface ICubeResourceOptions extends ISize
{
    autoLoad?: boolean;
}

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
    items: ArrayFixed<BaseTexture, 6>;

    constructor(source: ArrayFixed<string|Resource, 6>, options?: ICubeResourceOptions)
    {
        const { width, height, autoLoad } = options || {};

        super(source, { width, height });

        if (this.length !== CubeResource.SIDES)
        {
            throw new Error(`Invalid length. Got ${this.length}, expected 6`);
        }

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            this.items[i].target = TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        }

        if (autoLoad !== false)
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
    bind(baseTexture: BaseTexture): void
    {
        super.bind(baseTexture);

        baseTexture.target = TARGETS.TEXTURE_CUBE_MAP;
    }

    /**
     * Upload the resource
     *
     * @returns {boolean} true is success
     */
    upload(renderer: Renderer, _baseTexture: BaseTexture, glTexture: GLTexture): boolean
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

    /**
     * Used to auto-detect the type of resource.
     *
     * @static
     * @param {object} source - The source object
     * @return {boolean} `true` if source is an array of 6 elements
     */
    static test(source: any): source is ArrayFixed<string|Resource, 6>
    {
        return Array.isArray(source) && source.length === CubeResource.SIDES;
    }
}
