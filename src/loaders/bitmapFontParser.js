let Resource = require('resource-loader').Resource,
    core = require('../core'),
    extras = require('../extras'),
    path = require('path');


function parse(resource, texture) {
    let data = {};
    let info = resource.data.getElementsByTagName('info')[0];
    let common = resource.data.getElementsByTagName('common')[0];

    data.font = info.getAttribute('face');
    data.size = parseInt(info.getAttribute('size'), 10);
    data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
    data.chars = {};

    //parse letters
    let letters = resource.data.getElementsByTagName('char');

    for (let i = 0; i < letters.length; i++)
    {
        let charCode = parseInt(letters[i].getAttribute('id'), 10);

        let textureRect = new core.Rectangle(
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
            texture: new core.Texture(texture.baseTexture, textureRect)

        };
    }

    //parse kernings
    let kernings = resource.data.getElementsByTagName('kerning');
    for (let i = 0; i < kernings.length; i++)
    {
        let first = parseInt(kernings[i].getAttribute('first'), 10);
        let second = parseInt(kernings[i].getAttribute('second'), 10);
        let amount = parseInt(kernings[i].getAttribute('amount'), 10);

        if(data.chars[second])
        {
            data.chars[second].kerning[first] = amount;
        }
    }

    resource.bitmapFont = data;

    // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
    // but it's very likely to change
    extras.BitmapText.fonts[data.font] = data;
}


module.exports = function ()
{
    return function (resource, next)
    {
        // skip if no data or not xml data
        if (!resource.data || !resource.isXml)
        {
            return next();
        }

        // skip if not bitmap font data, using some silly duck-typing
        if (
            resource.data.getElementsByTagName('page').length === 0 ||
            resource.data.getElementsByTagName('info').length === 0 ||
            resource.data.getElementsByTagName('info')[0].getAttribute('face') === null
            )
        {
            return next();
        }

        let xmlUrl = !resource.isDataUrl ? path.dirname(resource.url) : '';

        if (resource.isDataUrl) {
            if (xmlUrl === '.') {
                xmlUrl = '';
            }

            if (this.baseUrl && xmlUrl) {
                // if baseurl has a trailing slash then add one to xmlUrl so the replace works below
                if (this.baseUrl.charAt(this.baseUrl.length - 1) === '/') {
                    xmlUrl += '/';
                }

                // remove baseUrl from xmlUrl
                xmlUrl = xmlUrl.replace(this.baseUrl, '');
            }
        }
        
        // if there is an xmlUrl now, it needs a trailing slash. Ensure that it does if the string isn't empty.
        if (xmlUrl && xmlUrl.charAt(xmlUrl.length - 1) !== '/') {
            xmlUrl += '/';
        }
        
        let textureUrl = xmlUrl + resource.data.getElementsByTagName('page')[0].getAttribute('file');
        if (core.utils.TextureCache[textureUrl]) {
            //reuse existing texture
            parse(resource, core.utils.TextureCache[textureUrl]);
            next();
        }
        else {
            let loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: Resource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata
            };
            // load the texture for the font
            this.add(resource.name + '_image', textureUrl, loadOptions, function (res) {
                parse(resource, res.texture);
                next();
            });
        }
    };
};
