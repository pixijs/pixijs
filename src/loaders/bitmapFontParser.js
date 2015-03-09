var Resource = require('resource-loader').Resource,
    core = require('../core'),
    text = require('../text');

module.exports = function ()
{
    return function (resource, next)
    {
        if (!resource.data || navigator.isCocoonJS)
        {
            if (window.DOMParser)
            {
                var domparser = new DOMParser();
                resource.data = domparser.parseFromString(this.xhr.responseText, 'text/xml');
            }
            else
            {
                var div = document.createElement('div');
                div.innerHTML = this.xhr.responseText;
                resource.data = div;
            }
        }

        var name = resource.data.nodeName;

        // skip if no data
        if (!resource.data || !name || (name.toLowerCase() !== '#document' && name.toLowerCase() !== 'div'))
        {
            return next();
        }

        var textureUrl = resource.data.getElementsByTagName('page')[0].getAttribute('file');
        var loadOptions = {
            crossOrigin: resource.crossOrigin,
            loadType: Resource.LOAD_TYPE.IMAGE
        };

        // load the texture for the font
        this.add(resource.name + '_image', textureUrl, loadOptions, function (res)
        {
            var data = {};
            var info = resource.data.getElementsByTagName('info')[0];
            var common = resource.data.getElementsByTagName('common')[0];

            data.font = info.getAttribute('face');
            data.size = parseInt(info.getAttribute('size'), 10);
            data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
            data.chars = {};

            //parse letters
            var letters = resource.data.getElementsByTagName('char');

            for (var i = 0; i < letters.length; i++)
            {
                var charCode = parseInt(letters[i].getAttribute('id'), 10);

                var textureRect = new core.math.Rectangle(
                    parseInt(letters[i].getAttribute('x'), 10),
                    parseInt(letters[i].getAttribute('y'), 10),
                    parseInt(letters[i].getAttribute('width'), 10),
                    parseInt(letters[i].getAttribute('height'), 10)
                );

                data.chars[charCode] = {
                    xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
                    yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
                    xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10),
                    kerning: {},
                    texture: core.utils.TextureCache[charCode] = new core.Texture(res.texture.baseTexture, textureRect)

                };
            }

            //parse kernings
            var kernings = resource.data.getElementsByTagName('kerning');
            for (i = 0; i < kernings.length; i++)
            {
                var first = parseInt(kernings[i].getAttribute('first'), 10);
                var second = parseInt(kernings[i].getAttribute('second'), 10);
                var amount = parseInt(kernings[i].getAttribute('amount'), 10);

                data.chars[second].kerning[first] = amount;

            }

            resource.bitmapFont = data;

            // I'm leaving this as a temporary fix so we can test the bitmap fonts in v3
            // but it's very likely to change
            text.BitmapText.fonts[data.font] = data;

            next();
        });
    };
};
