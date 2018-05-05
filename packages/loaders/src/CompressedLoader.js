import { Resource } from 'resource-loader';
import { BaseTexture, Texture, resources } from '@pixi/core';

const { CompressedResource } = resources;
const { TYPES } = CompressedResource;

/**
 * Loader plugin for handling Compressed texture resources.
 * @class
 * @memberof PIXI
 * @extends PIXI.Loader~LoaderPlugin
 */
export default class CompressedLoader
{
    /**
     * Function to call immediate after registering plugin.
     * @see PIXI.Loader~registerPlugin
     */
    static add()
    {
        for (let i = 0; i < TYPES.length; i++)
        {
            Resource.setExtensionXhrType(TYPES[i], Resource.XHR_RESPONSE_TYPE.BUFFER);
        }
    }

    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader~registerPlugin
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource, next)
    {
        const { data, extension } = resource;

        if (data instanceof ArrayBuffer && TYPES.indexOf(extension) > -1)
        {
            const source = CompressedResource.fromArrayBuffer(data);

            // TODO: make something like `fromLoader` but for compressed
            resource.texture = new Texture(new BaseTexture(source));
        }

        next();
    }
}
