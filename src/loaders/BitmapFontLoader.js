var core = require('../core'),
    ImageLoader = require('./ImageLoader');

/**
 * The xml loader is used to load in XML bitmap font data ('xml' or 'fnt')
 * To generate the data you can use http://www.angelcode.com/products/bmfont/
 * This loader will also load the image file as the data.
 * When loaded this class will dispatch a 'loaded' event
 *
 * @class
 * @mixes EventTarget
 * @namespace PIXI
 * @param url {String} The url of the sprite sheet JSON file
 * @param crossorigin {boolean} Whether requests should be treated as crossorigin
 */
function BitmapFontLoader(url, crossorigin) {
    /**
     * The url of the bitmap font data
     *
     * @member {String}
     */
    this.url = url;

    /**
     * Whether the requests should be treated as cross origin
     *
     * @member {boolean}
     */
    this.crossorigin = crossorigin;

    /**
     * The base url of the bitmap font data
     *
     * @member {String}
     * @readOnly
     */
    this.baseUrl = url.replace(/[^\/]*$/, '');

    /**
     * The texture of the bitmap font
     *
     * @member {Texture}
     */
    this.texture = null;
}

// constructor
BitmapFontLoader.prototype.constructor = BitmapFontLoader;
module.exports = BitmapFontLoader;

core.utils.EventTarget.mixin(BitmapFontLoader.prototype);

/**
 * Loads the XML font data
 *
 */
BitmapFontLoader.prototype.load = function () {
    this.ajaxRequest = new core.utils.AjaxRequest();
    this.ajaxRequest.onreadystatechange = this.onXMLLoaded.bind(this);

    this.ajaxRequest.open('GET', this.url, true);

    if (this.ajaxRequest.overrideMimeType) {
        this.ajaxRequest.overrideMimeType('application/xml');
    }

    this.ajaxRequest.send(null);
};

/**
 * Invoked when the XML file is loaded, parses the data.
 *
 * @private
 */
BitmapFontLoader.prototype.onXMLLoaded = function () {
    if (this.ajaxRequest.readyState === 4) {
        if (this.ajaxRequest.status === 200 || window.location.protocol.indexOf('http') === -1) {
            var responseXML = this.ajaxRequest.responseXML;
            if (!responseXML || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
                if (typeof(window.DOMParser) === 'function') {
                    var domparser = new DOMParser();
                    responseXML = domparser.parseFromString(this.ajaxRequest.responseText, 'text/xml');
                } else {
                    var div = document.createElement('div');
                    div.innerHTML = this.ajaxRequest.responseText;
                    responseXML = div;
                }
            }

            var textureUrl = this.baseUrl + responseXML.getElementsByTagName('page')[0].getAttribute('file');
            var image = new ImageLoader(textureUrl, this.crossorigin);
            this.texture = image.texture.baseTexture;

            var data = {};
            var info = responseXML.getElementsByTagName('info')[0];
            var common = responseXML.getElementsByTagName('common')[0];
            data.font = info.getAttribute('face');
            data.size = parseInt(info.getAttribute('size'), 10);
            data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10);
            data.chars = {};

            //parse letters
            var letters = responseXML.getElementsByTagName('char');

            for (var i = 0; i < letters.length; i++) {
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
                    texture: core.utils.TextureCache[charCode] = new core.Texture(this.texture, textureRect)

                };
            }

            //parse kernings
            var kernings = responseXML.getElementsByTagName('kerning');
            for (i = 0; i < kernings.length; i++) {
                var first = parseInt(kernings[i].getAttribute('first'), 10);
                var second = parseInt(kernings[i].getAttribute('second'), 10);
                var amount = parseInt(kernings[i].getAttribute('amount'), 10);

                data.chars[second].kerning[first] = amount;

            }

            core.BitmapText.fonts[data.font] = data;

            image.addEventListener('loaded', this.onLoaded.bind(this));
            image.load();
        }
    }
};

/**
 * Invoked when all files are loaded (xml/fnt and texture)
 *
 * @private
 */
BitmapFontLoader.prototype.onLoaded = function () {
    this.emit('loaded', { content: this });
};
