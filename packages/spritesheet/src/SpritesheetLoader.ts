import { url } from '@pixi/utils';
import { Spritesheet } from './Spritesheet';
import { LoaderResource } from '@pixi/loaders';
import type { Loader, ILoaderResource } from '@pixi/loaders';

/**
 * {@link PIXI.Loader} middleware for loading texture atlases that have been created with
 * TexturePacker or similar JSON-based spritesheet.
 *
 * This middleware automatically generates Texture resources.
 *
 * If you're using Webpack or other bundlers and plan on bundling the atlas' JSON,
 * use the {@link PIXI.Spritesheet} class to directly parse the JSON.
 *
 * The Loader's image Resource name is automatically appended with `"_image"`.
 * If a Resource with this name is already loaded, the Loader will skip parsing the
 * Spritesheet. The code below will generate an internal Loader Resource called `"myatlas_image"`.
 *
 * @example
 * loader.add('myatlas', 'path/to/myatlas.json');
 * loader.load(() => {
 *   loader.resources.myatlas; // atlas JSON resource
 *   loader.resources.myatlas_image; // atlas Image resource
 * });
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.ILoaderPlugin
 */
export class SpritesheetLoader
{
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource: ILoaderResource, next: (...args: unknown[]) => void): void
    {
        // because this is middleware, it execute in loader context. `this` = loader
        const loader = (this as any) as Loader;
        const imageResourceName = `${resource.name}_image`;

        // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
        if (!resource.data
            || resource.type !== LoaderResource.TYPE.JSON
            || !resource.data.frames
            || loader.resources[imageResourceName]
        )
        {
            next();

            return;
        }

        const loadOptions = {
            crossOrigin: resource.crossOrigin,
            metadata: resource.metadata.imageMetadata,
            parentResource: resource,
        };

        const resourcePath = SpritesheetLoader.getResourcePath(resource, loader.baseUrl);

        // load the image for this sheet
        loader.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res: ILoaderResource)
        {
            if (res.error)
            {
                next(res.error);

                return;
            }

            const spritesheet = new Spritesheet(
                res.texture,
                resource.data,
                resource.url
            );

            spritesheet.parse(() =>
            {
                resource.spritesheet = spritesheet;
                resource.textures = spritesheet.textures;
                next();
            });
        });
    }

    /**
     * Get the spritesheets root path
     * @param {PIXI.LoaderResource} resource - Resource to check path
     * @param {string} baseUrl - Base root url
     */
    static getResourcePath(resource: ILoaderResource, baseUrl: string): string
    {
        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl)
        {
            return resource.data.meta.image;
        }

        return url.resolve(resource.url.replace(baseUrl, ''), resource.data.meta.image);
    }
}
