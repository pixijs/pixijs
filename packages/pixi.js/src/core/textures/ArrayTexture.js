import Texture from './BaseTexture';
import ImageResource from './resources/ImageResource';
import { TARGETS } from './../const';

export default class ArrayTexture extends Texture
{
    constructor(width, height, size, format)
    {
        super(null, 0, 1, width, height, format);

        this.target = TARGETS.TEXTURE_2D_ARRAY;
        this.size = size;
        this._new = true;
        this.array = [];
    }

    setResource(resource, index)
    {
        let layer = this.array[index];

        if (!layer)
        {
            layer = this.array[index] = { index, texture: this, resource: null, texturePart: true, dirtyId: 0 };
        }

        layer.resource = resource;

        resource.load.then((resource) =>
{
            if (layer.resource === resource)
            {
                this.validate();
                this.dirtyId++;
            }
        });
    }

    validate()
    {
        let valid = true;

        if (this.width === -1 || this.height === -1)
        {
            valid = false;
        }

        if (this.array)
        {
            for (let i = 0; i < this.array.length; i++)
{
                const layer = this.array[i];

                if (layer.resource && !layer.resource.loaded)
                {
                    valid = false;
                    break;
                }
            }
        }

        this.valid = valid;
    }

    static from(width, height, ...urls)
    {
        const arrayTexture = new ArrayTexture(width, height);

        for (let i = 0; i < 6; i++)
        {
            arrayTexture.setResource(ImageResource.from(urls[i % urls.length]), i);
        }

        return arrayTexture;
    }
}
