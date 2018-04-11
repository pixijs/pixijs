import { Resource } from 'resource-loader';
import { BaseTexture, Texture, resources } from '@pixi/core';

Resource.setExtensionXhrType('dds', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('pvr', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('etc1', Resource.XHR_RESPONSE_TYPE.BUFFER);
Resource.setExtensionXhrType('astc', Resource.XHR_RESPONSE_TYPE.BUFFER);

/**
 * Loader plugin for handling Texture resources.
 * @class
 * @memberof PIXI
 * @extends PIXI.Loader~LoaderPlugin
 */
export default class TextureLoader
{
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader~loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource, next)
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

        if (resource.data instanceof ArrayBuffer)
        {
            if (resource.url.indexOf('.dds') !== -1 || resource.url.indexOf('.pvr') !== -1
                || resource.url.indexOf('.etc1') !== -1 || resource.url.indexOf('.astc') !== -1)
            {
                const compressedImage = resources.CompressedResource.fromArrayBuffer(resource.data);

                // TODO: make something like `fromLoader` but for compressed

                resource.texture = new Texture(new BaseTexture(compressedImage));
            }
        }

        next();
    }
}
