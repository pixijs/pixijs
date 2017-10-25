import { Resource } from 'resource-loader';
import { Texture } from '@pixi/core';

export default function ()
{
    return function textureParser(resource, next)
    {
        // create a new texture if the data is an Image object
        if (resource.data && resource.type === Resource.TYPE.IMAGE)
        {
            resource.texture = Texture.fromLoader(
                resource.data,
                resource.url,
                resource.name
            );
        }
        next();
    };
}
