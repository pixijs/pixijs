import { Resource } from 'resource-loader';
import { Texture } from '@pixi/core';

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
        next();
    }
}
