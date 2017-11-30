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
 * @param {Array<string>} [urls] Collection of URLs to load as images.
 */
export default class CubeResource extends Resource
{
    constructor(urls = null)
    {
        super();

        this.sides = [];
        this.sideDirtyIds = [];

        for (let i = 0; i < 6; i++)
        {
            const partTexture = new BaseTexture();

            partTexture.target = TARGETS.TEXTURE_CUBE_MAP + i;
            this.sides.push(partTexture);
            this.sideDirtyIds.push(-1);
        }

        if (urls)
        {
            for (let i = 0; i < 6; i++)
            {
                this.setResource(new ImageResource(urls[i]), i);
            }
        }
    }

    /**
     * Set a resource by index
     *
     * @param {PIXI.resources.IResource} resource - Resource to upload
     * @param {number} index - Index to use, zero-based
     */
    setResource(resource, index)
    {
        this.sides[index].setResource(resource);
    }

    /**
     * Set the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    set parent(parent)
    {
        parent.target = TARGETS.TEXTURE_CUBE_MAP;
        super.parent = parent;
    }

    _validate()
    {
        const { parent } = this;

        parent.setRealSize(this.width, this.height);

        const update = parent.update.bind(parent);

        for (let i = 0; i < 6; i++)
        {
            this.sides[i].on('update', update);
        }
    }

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
            this._width = resources[0].width;
            this._height = resources[0].height;
            if (this.parent)
            {
                this._validate();
            }
        });

        return this._load;
    }

    upload(renderer, baseTexture, glTexture)
    {
        const dirty = this.sideDirtyIds;

        for (let i = 0; i < 6; i++)
        {
            const texturePart = this.sides[i];

            if (dirty[i] < texturePart.dirtyId)
            {
                dirty[i] = texturePart.dirtyId;
                if (texturePart.valid)
                {
                    texturePart.resource.upload(renderer, texturePart, glTexture);
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
