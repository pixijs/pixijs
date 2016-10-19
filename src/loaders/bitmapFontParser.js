import * as path from 'path';
import { Rectangle, Texture, utils } from '../core';
import { Resource } from 'resource-loader';
import { BitmapText } from '../extras';

export function parse(resource, texture)
{
    const data = {};
    const info = resource.data.getElementsByTagName('info')[0];
    const common = resource.data.getElementsByTagName('common')[0];

    data.font = info.getAttribute('face');
    data.size = parseInt(info.getAttribute('size'), 10);
    data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
    data.chars = {};

    // parse letters
    const letters = resource.data.getElementsByTagName('char');

    for (let i = 0; i < letters.length; i++)
    {
        const charCode = parseInt(letters[i].getAttribute('id'), 10);

        const textureRect = new Rectangle(
            parseInt(letters[i].getAttribute('x'), 10) + texture.frame.x,
            parseInt(letters[i].getAttribute('y'), 10) + texture.frame.y,
            parseInt(letters[i].getAttribute('width'), 10),
            parseInt(letters[i].getAttribute('height'), 10)
        );

        data.chars[charCode] = {
            xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
            yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
            xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10),
            kerning: {},
            texture: new Texture(texture.baseTexture, textureRect),

        };
    }

    // parse kernings
    const kernings = resource.data.getElementsByTagName('kerning');

    for (let i = 0; i < kernings.length; i++)
    {
        const first = parseInt(kernings[i].getAttribute('first'), 10);
        const second = parseInt(kernings[i].getAttribute('second'), 10);
        const amount = parseInt(kernings[i].getAttribute('amount'), 10);

        if (data.chars[second])
        {
            data.chars[second].kerning[first] = amount;
        }
    }

    resource.bitmapFont = data;

    // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
    // but it's very likely to change
    BitmapText.fonts[data.font] = data;
}

export default function ()
{
    return function bitmapFontParser(resource, next)
    {
        // skip if no data or not xml data
        if (!resource.data || !resource.isXml)
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

                // remove baseUrl from xmlUrl
                xmlUrl = xmlUrl.replace(this.baseUrl, '');
            }
        }

        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/')
        {
            xmlUrl += '/';
        }

        const textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');

        if (utils.TextureCache[textureUrl])
        {
            // reuse existing texture
            parse(resource, utils.TextureCache[textureUrl]);
            next();
        }
        else
        {
            const loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata,
            };

            // load the texture for the font
            this.add(`${resource.name}_image`, textureUrl, loadOptions, (res) =>
            {
                parse(resource, res.texture);
                next();
            });
        }
    };
}
