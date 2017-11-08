import url from 'url';
import { Resource, Loader } from '@pixi/loaders';
import Spritesheet from './Spritesheet';

/**
 * {@link PIXI.loaders.Loader Loader} middleware for loading
 * texture atlases that have been created with TexturePacker or
 * similar JSON-based spritesheet. This automatically generates
 * Texture resources.
 * @class
 * @memberof PIXI
 */
export default class SpritesheetLoader
{
    /**
     * Middleware function to support Spritesheets, this is automatically installed.
     * @see PIXI.loaders.Loader.useMiddleware
     */
    static middleware()
    {
        return function spritesheetLoader(resource, next)
        {
            const imageResourceName = `${resource.name}_image`;

            // skip if no data, its not json, it isn't spritesheet data, or the image resource already exists
            if (!resource.data
                || resource.type !== Resource.TYPE.JSON
                || !resource.data.frames
                || this.resources[imageResourceName]
            )
            {
                next();

                return;
            }

            const loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata,
                parentResource: resource,
            };

            const resourcePath = SpritesheetLoader.getResourcePath(resource, this.baseUrl);

            // load the image for this sheet
            this.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res)
            {
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
        };
    }

    /**
     * Get the spritesheets root path
     * @param {PIXI.loader.Resource} resource - Resource to check path
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

// Install loader support for Spritesheet objects
Loader.useMiddleware(SpritesheetLoader.middleware);
