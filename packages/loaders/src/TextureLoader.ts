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
     * Handle SVG elements a text, render with SVGResource.
     */
    public static add(): void
    {
        Resource.setExtensionLoadType('svg', Resource.LOAD_TYPE.XHR);
        Resource.setExtensionXhrType('svg', Resource.XHR_RESPONSE_TYPE.TEXT);
    }

    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    public static use(resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        // create a new texture if the data is an Image object
        if (resource.data && (resource.type === Resource.TYPE.IMAGE || resource.extension === 'svg'))
        {
            const { data, url, name, metadata } = resource;

            Texture.fromLoader(data, url, name, metadata).then((texture) =>
            {
                resource.texture = texture;
                next();
            })
            // TODO: handle errors in Texture.fromLoader
            // so we can pass them to the Loader
                .catch(next);
        }
        else
        {
            next();
        }
    }
}
