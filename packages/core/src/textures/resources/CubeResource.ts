import { AbstractMultiResource } from './AbstractMultiResource';
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
    linkBaseTexture?: boolean;
}

/**
 * Resource for a CubeTexture which contains six resources.
 *
 * @class
 * @extends PIXI.ArrayResource
 * @memberof PIXI
 */
export class CubeResource extends AbstractMultiResource
{
    items: ArrayFixed<BaseTexture, 6>;

    linkBaseTexture: boolean;

    /**
     * @param {Array<string|PIXI.Resource>} [source] - Collection of URLs or resources
     *        to use as the sides of the cube.
     * @param {object} [options] - ImageResource options
     * @param {number} [options.width] - Width of resource
     * @param {number} [options.height] - Height of resource
     * @param {number} [options.autoLoad=true] - Whether to auto-load resources
     * @param {number} [options.linkBaseTexture=true] - In case BaseTextures are supplied,
     *   whether to copy them or use
     */
    constructor(source?: ArrayFixed<string|Resource, 6>, options?: ICubeResourceOptions)
    {
        const { width, height, autoLoad, linkBaseTexture } = options || {};

        if (source && source.length !== CubeResource.SIDES)
        {
            throw new Error(`Invalid length. Got ${source.length}, expected 6`);
        }

        super(6, { width, height });

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            this.items[i].target = TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
        }

        /**
         * In case BaseTextures are supplied, whether to use same resource or bind baseTexture itself
         * @member {boolean}
         * @protected
         */
        this.linkBaseTexture = linkBaseTexture !== false;

        if (source)
        {
            this.initFromArray(source, options);
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

    addBaseTextureAt(baseTexture: BaseTexture, index: number, linkBaseTexture?: boolean): this
    {
        if (linkBaseTexture === undefined)
        {
            linkBaseTexture = this.linkBaseTexture;
        }

        if (!this.items[index])
        {
            throw new Error(`Index ${index} is out of bounds`);
        }

        if (!this.linkBaseTexture
            || baseTexture.parentTextureArray
            || Object.keys(baseTexture._glTextures).length > 0)
        {
            // copy mode
            if (baseTexture.resource)
            {
                this.addResourceAt(baseTexture.resource, index);
            }
            else
            {
                throw new Error(`CubeResource does not support copying of renderTexture.`);
            }
        }
        else
        {
            // link mode, the difficult one!
            baseTexture.target = TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + index;
            baseTexture.parentTextureArray = this.baseTexture;

            this.items[index] = baseTexture;
        }

        if (baseTexture.valid && !this.valid)
        {
            this.resize(baseTexture.realWidth, baseTexture.realHeight);
        }

        this.items[index] = baseTexture;

        return this;
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
                if (side.valid && side.resource)
                {
                    side.resource.upload(renderer, side, glTexture);
                    dirty[i] = side.dirtyId;
                }
                else if (dirty[i] < -1)
                {
                    // either item is not valid yet, either its a renderTexture
                    // allocate the memory
                    renderer.gl.texImage2D(side.target, 0,
                        glTexture.internalFormat,
                        _baseTexture.realWidth,
                        _baseTexture.realHeight,
                        0,
                        _baseTexture.format,
                        glTexture.type,
                        null);
                    dirty[i] = -1;
                }
            }
        }

        return true;
    }

    /**
     * Number of texture sides to store for CubeResources
     *
     * @name PIXI.CubeResource.SIDES
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
    static test(source: unknown): source is ArrayFixed<string|Resource, 6>
    {
        return Array.isArray(source) && source.length === CubeResource.SIDES;
    }
}
