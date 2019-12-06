import { LoaderResource } from '@pixi/loaders';
import { BitmapText } from './BitmapText';

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
     * Register a BitmapText font from loader resource.
     *
     * @param {PIXI.LoaderResource} resource - Loader resource.
     * @param {PIXI.Texture} texture - Reference to texture.
     */
    static parse(resource, texture)
    {
        resource.bitmapFont = BitmapText.registerFont(resource.data, texture);
    }

    /**
     * Called when the plugin is installed.
     *
     * @see PIXI.Loader.registerPlugin
     */
    static add()
    {
        LoaderResource.setExtensionXhrType('fnt', LoaderResource.XHR_RESPONSE_TYPE.DOCUMENT);
    }

    /**
     * Replacement for NodeJS's path.dirname
     * @private
     * @param {string} url Path to get directory for
     */
    static dirname(url)
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

    /**
     * Called after a resource is loaded.
     * @see PIXI.Loader.loaderMiddleware
     * @param {PIXI.LoaderResource} resource
     * @param {function} next
     */
    static use(resource, next)
    {
        if (resource.data && resource.type === LoaderResource.TYPE.TEXT && resource.data.startsWith('info face='))
        {
            BitmapFontLoader.useTxt.bind(this)(resource, next);
            return;
        }
        
        // skip if no data or not xml data
        if (!resource.data || resource.type !== LoaderResource.TYPE.XML)
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

        BitmapFontLoader.useXml.bind(this)(resource, next);
    }

    /**
     * Get folder path from a resource
     * @param {PIXI.LoaderResource} resource 
     */
    static getResourceDir(resource)
    {
        let resUrl = !resource.isDataUrl ? BitmapFontLoader.dirname(resource.url) : '';

        if (resource.isDataUrl)
        {
            if (resUrl === '.')
            {
                resUrl = '';
            }

            if (this.baseUrl && resUrl)
            {
                // if baseurl has a trailing slash then add one to resUrl so the replace works below
                if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/')
                {
                    resUrl += '/';
                }
            }
        }

        // remove baseUrl from resUrl
        resUrl = resUrl.replace(this.baseUrl, '');

        // if there is an resUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (resUrl && resUrl.charAt(resUrl.length - 1) !== '/')
        {
            resUrl += '/';
        }

        return resUrl;
    }

    static useXml(resource, next)
    {
        const xmlUrl = BitmapFontLoader.getResourceDir(resource);
        const pages = resource.data.getElementsByTagName('page');
        const textures = {};

        // Handle completed, when the number of textures
        // load is the same number as references in the fnt file
        const completed = (page) =>
        {
            textures[page.metadata.pageFile] = page.texture;

            if (Object.keys(textures).length === pages.length)
            {
                BitmapFontLoader.parse(resource, textures);
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

    static useTxt(resource, next)
    {
        const fontData = BitmapFontLoader.txtToFontData(resource.data);
        const txtUrl = BitmapFontLoader.getResourceDir(resource);
        const pages = fontData.page;
        const textures = {};

        // Handle completed, when the number of textures
        // load is the same number as references in the fnt file
        const completed = (page) =>
        {
            textures[page.metadata.pageFile] = page.texture;

            if (Object.keys(textures).length === pages.length)
            {
                resource.bitmapFont = BitmapText.registerFontObj(fontData, textures);
                next();
            }
        };

        for (let i = 0; i < pages.length; ++i)
        {
            const pageFile = pages[i]['file'];
            const url = txtUrl + pageFile;
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
     * Convert text font data to a javascript object
     * @param {string} txt Raw string data to be converted
     * @return {Object} Parsed font data
     */
    static txtToFontData(txt) 
    {
        // Retrieve data item
        const items = txt.match(/^[a-z]+\s+.+$/gm);
        const data =  {};
        for (let i in items) 
        {
            // Extract item name
            const name = items[i].match(/^[a-z]+/gm)[0];

            // Extract item attribute list as string ex.: "width=10"
            const attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);

            // Convert attribute list into an object
            const itemData = {};
            for (let i in attributeList) 
            {
                // Split key-value pairs
                const split = attributeList[i].split('=');
                const key = split[0];

                // Remove eventual quotes from value
                const strValue = split[1].replace(/"/gm, '')

                // Try to convert value into float
                const floatValue = parseFloat(strValue);

                // Use string value case float value is NaN
                const value = isNaN(floatValue) ? strValue : floatValue;
                itemData[key] = value;
            }

            // Push current item to the resulting data
            if (!data[name]) data[name] = [];
            data[name].push(itemData);
        }

        // Validate data
        if (!data['info'] || !data['info'][0]) throw new Error('Font info not found');
        if (!data['info'][0].face) throw new Error('Invalid font face');
        if (data['info'][0].face.indexOf(' ') >= 0) throw new Error('Font face name should not contain spaces');
        
        return data;
    }
}
