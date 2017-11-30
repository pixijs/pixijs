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
 * @param {number|Array<string>} size - Number of items in array or the collection
 *        of image URLs to use
 */
export default class ArrayResource extends Resource
{
    constructor(width, height, size)
    {
        let urls;

        if (typeof size !== 'number')
        {
            urls = size;
            size = urls.length;
        }

        super(width, height);

        /**
         * Collection of resources.
         * @member {Array<PIXI.BaseTexture>}
         * @readonly
         */
        this.parts = [];

        /**
         * Dirty IDs for each part
         * @member {Array<number>}
         * @readonly
         */
        this.partDirtyIds = [];

        for (let i = 0; i < size; i++)
        {
            const partTexture = new BaseTexture();

            this.parts.push(partTexture);
            this.partDirtyIds.push(-1);
        }

        this.size = size;

        if (urls)
        {
            for (let i = 0; i < size; i++)
            {
                this.setResource(new ImageResource(urls[i]), i);
            }
        }
    }

    /**
     * Destroy this BaseImageResource
     * @override
     * @param {PIXI.BaseTexture} [fromTexture] Optional base texture
     */
    destroy(fromTarget)
    {
        if (super.destroy(fromTarget))
        {
            const size = this.size;

            for (let i = 0; i < size; i++)
            {
                this.parts[i].destroy(fromTarget);
            }
            this.parts = null;
            this.partDirtyIds = null;
        }
    }

    /**
     * Set a resource by ID
     *
     * @param {PIXI.resources.Resource} resource
     * @param {number} index - Zero-based index of resource to set
     */
    setResource(resource, index)
    {
        this.parts[index].setResource(resource);
    }

    /**
     * Set the parent base texture
     * @member {PIXI.BaseTexture}
     * @override
     */
    set parent(parent)
    {
        parent.target = TARGETS.TEXTURE_2D_ARRAY;
        super.parent = parent;
    }

    _validate()
    {
        const { parent } = this;

        parent.setRealSize(this.width, this.height);

        const update = parent.update.bind(parent);
        const size = this.size;

        for (let i = 0; i < size; i++)
        {
            this.parts[i].on('update', update);
        }
    }

    load()
    {
        if (this._load)
        {
            return this._load;
        }

        const resources = this.parts.map((it) => it.resource);

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

    /**
     * Upload the resources to the GPU.
     * @param {PIXI.Renderer} renderer
     * @param {PIXI.BaseTexture} texture
     * @param {PIXI.glCore.GLTexture} glTexture
     */
    upload(renderer, texture, glTexture)
    {
        const { size, partDirtyIds, parts } = this;
        const { gl } = renderer;

        if (glTexture.dirtyId < 0)
        {
            gl.texImage3D(
                gl.TEXTURE_2D_ARRAY,
                0,
                texture.format,
                this._width,
                this._height,
                size,
                0,
                texture.format,
                texture.type,
                null
            );
        }

        for (let i = 0; i < size; i++)
        {
            const texturePart = parts[i];

            if (partDirtyIds[i] < texturePart.dirtyId)
            {
                partDirtyIds[i] = texturePart.dirtyId;
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
