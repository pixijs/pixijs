import * as path from 'path';
import { Resource } from 'resource-loader';
import { BitmapText } from '../extras';

/**
 * Register a BitmapText font from loader resource.
 *
 * @function parseBitmapFontData
 * @memberof PIXI.loaders
 * @param {PIXI.loaders.Resource} resource - Loader resource.
 * @param {PIXI.Texture|PIXI.Texture[]} textures - List of textures for each page.
 */
export function parse(resource, textures)
{
    resource.bitmapFont = BitmapText.registerFont(resource.data, textures);
}

export default function ()
{
    return function bitmapFontParser(resource, next)
    {
        // skip if no data or not xml data
        if (!resource.data || resource.type !== Resource.TYPE.XML)
        {
            next();

            return;
        }

        // skip if not bitmap font data, using some silly duck-typing
        if (resource.data.getElementsByTagName('page').length === 0
            || resource.data.getElementsByTagName('info').length === 0
            || resource.data.getElementsByTagName('info')[0].getAttribute('face') === null
        )
        {
            next();

            return;
        }

        let xmlUrl = !resource.isDataUrl ? path.dirname(resource.url) : '';

        if (resource.isDataUrl)
        {
            if (xmlUrl === '.')
            {
                xmlUrl = '';
            }

            if (this.baseUrl && xmlUrl)
            {
                // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
                if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/')
                {
                    xmlUrl += '/';
                }
            }
        }

        // remove baseUrl from xmlUrl
        xmlUrl = xmlUrl.replace(this.baseUrl, '');

        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/')
        {
            xmlUrl += '/';
        }

        const pages = resource.data.getElementsByTagName('page');
        const textures = {};

        // Handle completed, when the number of textures
        // load is the same number as references in the fnt file
        const completed = (page) =>
        {
            textures[page.metadata.pageFile] = page.texture;

            if (Object.keys(textures).length === pages.length)
            {
                parse(resource, textures);
                next();
            }
        };

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i].getAttribute('file');
            const url = xmlUrl + pageFile;
            let exists = false;

            // incase the image is loaded outside
            // using the same loader, resource will be available
            for (const name in this.resources)
            {
                const bitmapResource = this.resources[name];

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
                    loadType: Resource.LOAD_TYPE.IMAGE,
                    metadata: Object.assign(
                        { pageFile },
                        resource.metadata.imageMetadata
                    ),
                    parentResource: resource,
                };

                this.add(url, options, completed);
            }
        }
    };
}
