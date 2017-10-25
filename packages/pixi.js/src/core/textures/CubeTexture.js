import Texture from './BaseTexture';
import ImageResource from './resources/ImageResource';
import { TARGETS } from './../const';

export default class CubeTexture extends Texture
{
    constructor(width, height, format)
    {
        super(null, 0, 1, width, height, format);

        this.target = TARGETS.TEXTURE_CUBE_MAP; // gl.TEXTURE_CUBE_MAP

        this.resources = [];

        this.positiveX = { side: 0, texture: this, resource: null, texturePart: true, dirtyId: 0 };
        this.negativeX = { side: 1, texture: this, resource: null, texturePart: true, dirtyId: 0 };

        this.positiveY = { side: 2, texture: this, resource: null, texturePart: true, dirtyId: 0 };
        this.negativeY = { side: 3, texture: this, resource: null, texturePart: true, dirtyId: 0 };

        this.positiveZ = { side: 4, texture: this, resource: null, texturePart: true, dirtyId: 0 };
        this.negativeZ = { side: 5, texture: this, resource: null, texturePart: true, dirtyId: 0 };

        this.sides = [this.positiveX, this.negativeX,
            this.positiveY, this.negativeY,
            this.positiveZ, this.negativeZ];
    }

    setResource(resource, index)
    {
        const side = this.sides[index];

        side.resource = resource;

        resource.load.then((resource) =>
{
            if (side.resource === resource)
            {
                this.width = resource.width;
                this.height = resource.height;
                // we have not swapped half way!
                // side.dirtyId++;
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

        if (this.sides)
        {
            for (let i = 0; i < this.sides.length; i++)
{
                const side = this.sides[i];

                if (side.resource && !side.resource.loaded)
                {
                    valid = false;
                    break;
                }
            }
        }

        this.valid = valid;
    }

    static from(...urls)
    {
        const cubeTexture = new CubeTexture();

        for (let i = 0; i < 6; i++)
        {
            cubeTexture.setResource(ImageResource.from(urls[i % urls.length]), i);
        }

        return cubeTexture;
    }
}
