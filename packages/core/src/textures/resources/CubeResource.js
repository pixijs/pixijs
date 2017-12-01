import Resource from './Resource';
import ImageResource from './ImageResource';
import BaseTexture from '../BaseTexture';
import { TARGETS } from '@pixi/constants';

/**
 * Resource for a CubeTexture which contains six resources.
 *
 * @class
 * @extends PIXI.resources.Resource
 * @memberof PIXI.resources
 * @param {Array<string>} [source] Collection of URLs to load as images.
 */
export default class CubeResource extends Resource
{
    constructor(source)
    {
        super();

        this.sides = [];
        this.sideDirtyIds = [];

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            const baseTexture = new BaseTexture();

            baseTexture.target = TARGETS.TEXTURE_CUBE_MAP + i;
            this.sides.push(baseTexture);
            this.sideDirtyIds.push(-1);
        }

        if (source)
        {
            for (let i = 0; i < CubeResource.SIDES; i++)
            {
                this.addResourceAt(new ImageResource(source[i]), i);
            }
        }
    }

    /**
     * Set a resource by index
     *
     * @param {PIXI.resources.Resource} resource - Resource to upload
     * @param {number} index - Index to use, zero-based
     */
    addResourceAt(resource, index)
    {
        this.sides[index].setResource(resource);
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

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            this.sides[i].on('update', baseTexture.update, baseTexture);
        }
    }

    /**
     * Remove binding
     * @override
     * @param {PIXI.BaseTexture} baseTexture - parent base texture
     */
    unbind(baseTexture)
    {
        super.unbind(baseTexture);

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            this.sides[i].off('update', baseTexture.update, baseTexture);
        }
    }

    /**
     * Destroy this
     * @override
     * @return {boolean} if destroyed
     */
    dispose()
    {
        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            this.sides[i].destroy();
        }
        this.sides = null;
        this.sideDirtyIds = null;
    }

    /**
     * Start loading the resources
     */
    load()
    {
        if (this._load)
        {
            return this._load;
        }

        const resources = this.sides.map((it) => it.resource);

        // TODO: also implement load part-by-part strategy

        this._load = Promise.all(resources.map(
            (it) => it.load()
        )).then(() =>
        {
            this.loaded = true;
            this.resize(resources[0].width, resources[0].height);
        });

        return this._load;
    }

    /**
     * Uploade the resource
     */
    upload(renderer, baseTexture, glTexture)
    {
        const dirty = this.sideDirtyIds;

        for (let i = 0; i < CubeResource.SIDES; i++)
        {
            const side = this.sides[i];

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
