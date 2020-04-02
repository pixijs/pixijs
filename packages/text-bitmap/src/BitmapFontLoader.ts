import { LoaderResource } from '@pixi/loaders';
import { autoDetectFormat } from './formats';
import { BitmapFont } from './BitmapFont';

import type { ILoaderResource } from '@pixi/loaders';
import type { Dict } from '@pixi/utils';
import type { Loader } from '@pixi/loaders';
import type { Texture } from '@pixi/core';

/**
 * {@link PIXI.Loader Loader} middleware for loading
 * bitmap-based fonts suitable for using with {@link PIXI.BitmapText}.
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export class BitmapFontLoader
{
    /**
     * Called when the plugin is installed.
     *
     * @see PIXI.Loader.registerPlugin
     */
    public static add(): void
    {
        LoaderResource.setExtensionXhrType('fnt', LoaderResource.XHR_RESPONSE_TYPE.DOCUMENT);
    }

    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(this: Loader, resource: ILoaderResource, next: (...args: any[]) => void): void
    {
        const format = autoDetectFormat(resource.data);

        // Resource was not recognised as any of the expected font data format
        if (!format)
        {
            next();

            return;
        }

        const baseUrl = BitmapFontLoader.getBaseUrl(this, resource);
        const data = format.parse(resource.data);
        const textures: Dict<Texture> = {};

        // Handle completed, when the number of textures
        // load is the same number as references in the fnt file
        const completed = (page: ILoaderResource): void =>
        {
            textures[page.metadata.pageFile] = page.texture;

            if (Object.keys(textures).length === data.page.length)
            {
                resource.bitmapFont = BitmapFont.install(data, textures);
                next();
            }
        };

        for (let i = 0; i < data.page.length; ++i)
        {
            const pageFile = data.page[i].file;
            const url = baseUrl + pageFile;
            let exists = false;

            // incase the image is loaded outside
            // using the same loader, resource will be available
            for (const name in this.resources)
            {
                const bitmapResource: ILoaderResource = this.resources[name];

                if (bitmapResource.url === url)
                {
                    bitmapResource.metadata.pageFile = pageFile;
                    if (bitmapResource.texture)
                    {
                        completed(bitmapResource);
                    }
                    else
                    {
                        bitmapResource.onAfterMiddleware.add(completed);
                    }
                    exists = true;
                    break;
                }
            }

            // texture is not loaded, we'll attempt to add
            // it to the load and add the texture to the list
            if (!exists)
            {
                // Standard loading options for images
                const options = {
                    crossOrigin: resource.crossOrigin,
                    loadType: LoaderResource.LOAD_TYPE.IMAGE,
                    metadata: Object.assign(
                        { pageFile },
                        resource.metadata.imageMetadata
                    ),
                    parentResource: resource,
                };

                this.add(url, options, completed);
            }
        }
    }

    /**
     * Get folder path from a resource
     * @private
     * @param {PIXI.Loader} loader
     * @param {PIXI.LoaderResource} resource
     * @return {string}
     */
    private static getBaseUrl(loader: Loader, resource: ILoaderResource): string
    {
        let resUrl = !resource.isDataUrl ? BitmapFontLoader.dirname(resource.url) : '';

        if (resource.isDataUrl)
        {
            if (resUrl === '.')
            {
                resUrl = '';
            }

            if (loader.baseUrl && resUrl)
            {
                // if baseurl has a trailing slash then add one to resUrl so the replace works below
                if (loader.baseUrl.charAt(loader.baseUrl.length - 1) === '/')
                {
                    resUrl += '/';
                }
            }
        }

        // remove baseUrl from resUrl
        resUrl = resUrl.replace(loader.baseUrl, '');

        // if there is an resUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (resUrl && resUrl.charAt(resUrl.length - 1) !== '/')
        {
            resUrl += '/';
        }

        return resUrl;
    }

    /**
     * Replacement for NodeJS's path.dirname
     * @private
     * @param {string} url Path to get directory for
     */
    private static dirname(url: string): string
    {
        const dir = url
            .replace(/\\/g, '/') // convert windows notation to UNIX notation, URL-safe because it's a forbidden character
            .replace(/\/$/, '') // replace trailing slash
            .replace(/\/[^\/]*$/, ''); // remove everything after the last

        // File request is relative, use current directory
        if (dir === url)
        {
            return '.';
        }
        // Started with a slash
        else if (dir === '')
        {
            return '/';
        }

        return dir;
    }
}
