import TextureResource from './TextureResource';
import ImageResource from './ImageResource';
import BaseTexture from '../BaseTexture';
import { TARGETS } from '@pixi/constants';

/**
 * Resource for a CubeTexture which contains six resources.
 *
 * @class
 * @extends PIXI.TextureResource
 * @memberof PIXI
 */
export default class ArrayResource extends TextureResource
{
    constructor(width, height, size)
    {
        super();

        this.baseTexture = null;

        this.parts = [];
        this.partDirtyIds = [];

        for (let i = 0; i < size; i++)
        {
            const partTexture = new BaseTexture();

            this.parts.push(partTexture);
            this.partDirtyIds.push(-1);
        }

        this.loaded = false;
        this._load = null;
        this._width = width;
        this._height = height;
        this.size = size;
    }

    get width()
    {
        return this._width;
    }

    get height()
    {
        return this._height;
    }

    setResource(resource, index)
    {
        this.parts[index].setResource(resource);
    }

    onTextureNew(baseTexture)
    {
        baseTexture.target = TARGETS.TEXTURE_2D_ARRAY;
        super.onTextureNew(baseTexture);
    }

    _validate()
    {
        const baseTexture = this.baseTexture;

        baseTexture.setRealSize(this.width, this.height);

        const update = baseTexture.update.bind(baseTexture);
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
            if (this.baseTexture)
            {
                this._validate();
            }
        });

        return this._load;
    }

    onTextureUpload(renderer, texture, glTexture)
    {
        const dirty = this.partDirtyIds;
        const size = this.size;
        const gl = renderer.gl;

        if (glTexture.dirtyId < 0)
        {
            gl.texImage3D(gl.TEXTURE_2D_ARRAY,
                0,
                texture.format,
                texture.width,
                texture.height,
                6,
                0,
                texture.format,
                texture.type,
                null);
        }

        for (let i = 0; i < size; i++)
        {
            const texturePart = this.parts[i];

            if (dirty[i] < texturePart.dirtyId)
            {
                dirty[i] = texturePart.dirtyId;
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

    static from(width, height, ...urls)
    {
        const size = urls.length;
        const cubeResource = new ArrayResource(width, height, size);

        for (let i = 0; i < size; i++)
        {
            cubeResource.setResource(ImageResource.from(urls[i % urls.length]), i);
        }

        return cubeResource;
    }
}
