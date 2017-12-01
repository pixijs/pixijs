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
 * @param {number} width - Width of the resource
 * @param {number} height - Height of the resource
 * @param {number|Array<string>} length - Number of items in array or the collection
 *        of image URLs to use
 */
export default class ArrayResource extends Resource
{
    constructor(width, height, length)
    {
        let urls;

        if (Array.isArray(length))
        {
            urls = length;
            length = urls.length;
        }

        super(width, height);

        /**
         * Collection of resources.
         * @member {Array<PIXI.BaseTexture>}
         * @readonly
         */
        this.items = [];

        /**
         * Dirty IDs for each part
         * @member {Array<number>}
         * @readonly
         */
        this.itemDirtyIds = [];

        for (let i = 0; i < length; i++)
        {
            const partTexture = new BaseTexture();

            this.items.push(partTexture);
            this.itemDirtyIds.push(-1);
        }

        /**
         * Number of elements in array
         *
         * @member {number}
         * @readonly
         */
        this.length = length;

        if (urls)
        {
            for (let i = 0; i < length; i++)
            {
                this.addResourceAt(new ImageResource(urls[i]), i);
            }
        }
    }

    /**
     * Destroy this BaseImageResource
     * @override
     */
    dispose()
    {
        for (let i = 0, len = this.length; i < len; i++)
        {
            this.items[i].destroy();
        }
        this.items = null;
        this.itemDirtyIds = null;
    }

    /**
     * Set a resource by ID
     *
     * @param {PIXI.resources.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     */
    addResourceAt(resource, index)
    {
        this.items[index].setResource(resource);
    }

    /**
     * Set the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    bind(baseTexture)
    {
        super.bind(baseTexture);

        baseTexture.target = TARGETS.TEXTURE_2D_ARRAY;

        for (let i = 0; i < this.length; i++)
        {
            this.items[i].on('update', baseTexture.update, baseTexture);
        }
    }

    unbind(baseTexture)
    {
        super.unbind(baseTexture);

        for (let i = 0; i < this.length; i++)
        {
            this.items[i].off('update', baseTexture.update, baseTexture);
        }
    }

    load()
    {
        if (this._load)
        {
            return this._load;
        }

        const resources = this.items.map((it) => it.resource);

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
     * Upload the resources to the GPU.
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BaseTexture} texture
     * @param {PIXI.glCore.Texture} glTexture
     */
    upload(renderer, texture, glTexture)
    {
        const { length, itemDirtyIds, items } = this;
        const { gl } = renderer;

        if (glTexture.dirtyId < 0)
        {
            gl.texImage3D(
                gl.TEXTURE_2D_ARRAY,
                0,
                texture.format,
                this._width,
                this._height,
                length,
                0,
                texture.format,
                texture.type,
                null
            );
        }

        for (let i = 0; i < length; i++)
        {
            const texturePart = items[i];

            if (itemDirtyIds[i] < texturePart.dirtyId)
            {
                itemDirtyIds[i] = texturePart.dirtyId;
                if (texturePart.valid)
                {
                    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,
                        0,
                        0, // xoffset
                        0, // yoffset
                        i, // zoffset
                        texturePart.resource.width,
                        texturePart.resource.height,
                        1,
                        texture.format,
                        texture.type,
                        texturePart.resource.source);
                }
            }
        }

        return true;
    }
}
