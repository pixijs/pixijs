import url from 'url';

import { LoaderResource } from '@pixi/loaders';

/**
 * {@link PIXI.Loader Loader} middleware for loading TSX (Tile Set XML) files.
 * This automatically generate a Texture resource.
 * @class
 * @memberof PIXI
 * @extends PIXI.Loader~LoaderPlugin
 */
export default class TilesetLoader
{
    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader~loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource, next)
    {
        const tileset = resource.data;
        const imageResourceName = `${resource.name}_image`;

        // skip if no data, not a document, it isn't a tileset, contains no image, or the image resource already exists
        if (!tileset
            || resource.type !== LoaderResource.TYPE.XML
            || resource.extension !== 'tsx'
            || !tileset.getElementsByTagName('image').length
            || this.resources[imageResourceName]
        )
        {
            next();

            return;
        }

        const loadOptions = {
            crossOrigin: resource.crossOrigin,
            parentResource: resource,
        };

        const imageElement = tileset.getElementsByTagName('image')[0];
        const resourcePath = url.resolve(resource.url.replace(this.baseUrl, ''), imageElement.getAttribute('source'));

        // load the image for this tileset
        this.add(imageResourceName, resourcePath, loadOptions, (imageResource) =>
        {
            resource.texture = imageResource.texture;
            next();
        });
    }
}
