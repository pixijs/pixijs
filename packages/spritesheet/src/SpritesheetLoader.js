import url from 'url';
import { LoaderResource } from '@pixi/loaders';
import Spritesheet from './Spritesheet';

/**
 * {@link PIXI.Loader Loader} middleware for loading
 * texture atlases that have been created with TexturePacker or
 * similar JSON-based spritesheet. This automatically generates
 * Texture resources.
 * @class
 * @memberof PIXI
 * @extends PIXI.Loader~LoaderPlugin
 */
export default class SpritesheetLoader
{
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader~loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource, next)
    {

        // skip if no data, its not json, it isn't spritesheet data,
        if (!resource.data
            || resource.type !== LoaderResource.TYPE.JSON
            || !resource.data.frames)
        {
            next();

            return;
        }

        const resourcePath = SpritesheetLoader.getResourcePath(resource, this.baseUrl);

        let imageResourceName = url.resolve(resource.url, resource.data.meta.image);

        // resolve removes the ./ if present.
        // this name needs to be the exactly the same as the url path
        // so we add it back if its there
        if(resource.url.substring(0, 2) === './')
        {
            imageResourceName = './' + imageResourceName;
        }

        // skip if the image resource already exists
        if(this.resources[imageResourceName])
        {
            next();

            return;
        }

        const loadOptions = {
            crossOrigin: resource.crossOrigin,
            metadata: resource.metadata.imageMetadata,
            parentResource: resource,
        };

        // load the image for this sheet
        this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res)
        {
            if (res.error)
            {
                next(res.error);

                return;
            }

            const spritesheet = new Spritesheet(
                res.texture.baseTexture,
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
    static getResourcePath(resource, baseUrl)
    {
        // Prepend url path unless the resource image is a data url
        if (resource.isDataUrl)
        {
            return resource.data.meta.image;
        }

        return url.resolve(resource.url.replace(baseUrl, ''), resource.data.meta.image);
    }
}
