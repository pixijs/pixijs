var CONST = require('../const');

/**
 * @namespace PIXI.utils
 */
var utils = module.exports = {
    _uid: 0,
    _saidHello: false,

    EventEmitter:   require('eventemitter3'),
    pluginTarget:   require('./pluginTarget'),

    /**
     * Gets the next unique identifier
     *
     * @return {number} The next unique identifier to use.
     */
    uid: function ()
    {
        return ++utils._uid;
    },

    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @param hex {number}
     * @param  {number[]} [out=[]]
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb: function (hex, out)
    {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    /**
     * Converts a hex color number to a string.
     *
     * @param hex {number}
     * @return {string} The string color.
     */
    hex2string: function (hex)
    {
        hex = hex.toString(16);
        hex = '000000'.substr(0, 6 - hex.length) + hex;

        return '#' + hex;
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @param rgb {number[]}
     * @return {number} The color number
     */
    rgb2hex: function (rgb)
    {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },


    /**
     * get the resolution of an asset by looking for the prefix
     * used by spritesheets and image urls
     *
     * @param url {string} the image path
     * @return {number}
     */
    getResolutionOfUrl: function (url)
    {
        var resolution = CONST.RETINA_PREFIX.exec(url);

        if (resolution)
        {
           return parseFloat(resolution[1]);
        }

        return 1;
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set `PIXI.utils._saidHello = true;`
     * so the library thinks it already said it. Keep in mind that doing that will forever
     * makes you a jerk face.
     *
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello: function (type)
    {
        if (utils._saidHello)
        {
            return;
        }

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        {
            var args = [
                '\n %c %c %c Pixi.js ' + CONST.VERSION + ' - ✰ ' + type + ' ✰  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n',
                'background: #ff66a5; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff66a5; background: #030307; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'background: #ffc3dc; padding:5px 0;',
                'background: #ff66a5; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;',
                'color: #ff2424; background: #fff; padding:5px 0;'
            ];

            window.console.log.apply(console, args); //jshint ignore:line
        }
        else if (window.console)
        {
            window.console.log('Pixi.js ' + CONST.VERSION + ' - ' + type + ' - http://www.pixijs.com/'); //jshint ignore:line
        }

        utils._saidHello = true;
    },

    /**
     * Helper for checking for webgl support
     *
     * @return {boolean}
     */
    isWebGLSupported: function ()
    {
        var contextOptions = { stencil: true };
        try
        {
            if (!window.WebGLRenderingContext)
            {
                return false;
            }

            var canvas = document.createElement('canvas'),
                gl = canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);

            var success = !!(gl && gl.getContextAttributes().stencil);
            if (gl)
            {
                gl.getExtension('WEBGL_lose_context').loseContext();
            }
            gl = null;

            return success;
        }
        catch (e)
        {
            return false;
        }
    },

    /**
     * Returns sign of number
     *
     * @param n {number}
     * @returns {number} 0 if n is 0, -1 if n is negative, 1 if n i positive
     */
    sign: function (n)
    {
        return n ? (n < 0 ? -1 : 1) : 0;
    },

    /**
     * removeItems
     *
     * @param {*[]} arr The target array
     * @param {number} startIdx The index to begin removing from (inclusive)
     * @param {number} removeCount How many items to remove
     */
    removeItems: function (arr, startIdx, removeCount)
    {
        var length = arr.length;

        if (startIdx >= length || removeCount === 0)
        {
            return;
        }

        removeCount = (startIdx+removeCount > length ? length-startIdx : removeCount);
        for (var i = startIdx, len = length-removeCount; i < len; ++i)
        {
            arr[i] = arr[i + removeCount];
        }

        arr.length = len;
    },

    /**
     * @todo Describe property usage
     * @private
     */
    TextureCache: {},

    /**
     * @todo Describe property usage
     * @private
     */
    BaseTextureCache: {}
};
