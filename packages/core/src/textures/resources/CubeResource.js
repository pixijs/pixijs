import TextureResource from './TextureResource';
import ImageResource from './ImageResource';
import BaseTexture from '../BaseTexture';
import { TARGETS } from '@pixi/constants';

export default class CubeResource extends TextureResource
{
    constructor()
    {
        super();

        this.baseTexture = null;

        this.sides = [];
        this.sideDirtyIds = [];

        for (let i = 0; i < 6; i++)
        {
            const partTexture = new BaseTexture();

            partTexture.target = TARGETS.TEXTURE_CUBE_MAP + i;
            this.sides.push(partTexture);
            this.sideDirtyIds.push(-1);
        }

        this.loaded = false;
        this._load = null;
        this._width = 0;
        this._height = 0;
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
        this.sides[index].setResource(resource);
    }

    onTextureNew(baseTexture)
    {
        baseTexture.target = TARGETS.TEXTURE_CUBE_MAP;
        super.onTextureNew(baseTexture);
    }

    _validate()
    {
        const baseTexture = this.baseTexture;

        baseTexture.setRealSize(this.width, this.height);

        const update = baseTexture.update.bind(baseTexture);

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
            if (this.baseTexture)
            {
                this._validate();
            }
        });

        return this._load;
    }

    onTextureUpload(renderer, baseTexture, glTexture)
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
                    texturePart.resource.onTextureUpload(renderer, texturePart, glTexture);
                }
                else
                {
                    // TODO: upload zero buffer
                }
            }
        }

        return true;
    }

    static from(...urls)
    {
        const cubeResource = new CubeResource();

        for (let i = 0; i < 6; i++)
        {
            cubeResource.setResource(ImageResource.from(urls[i % urls.length]), i);
        }

        return cubeResource;
    }
}
