import { Resource } from 'resource-loader';
import { Texture } from '@pixi/core';

import type { ILoaderResource } from './LoaderResource';

/**
 * Loader plugin for handling Texture resources.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export class TextureLoader
{
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    public static use(resource: ILoaderResource, next: (...args: any[]) => void): void
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
