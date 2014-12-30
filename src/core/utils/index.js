var CONST = require('../const');

/**
 * @namespace PIXI
 */
var utils = module.exports = {
    _uid: 0,

    /**
     * Gets the next uuid
     *
     * @return {number} The next uuid to use.
     */
    uuid: function () {
        return ++utils._uid;
    },

    /**
     * Converts a hex color number to an [R, G, B] array
     *
     * @param hex {number}
     * @return {number[]} An array representing the [R, G, B] of the color.
     */
    hex2rgb: function (hex, out) {
        out = out || [];

        out[0] = (hex >> 16 & 0xFF) / 255;
        out[1] = (hex >> 8 & 0xFF) / 255;
        out[2] = (hex & 0xFF) / 255;

        return out;
    },

    /**
     * Converts a color as an [R, G, B] array to a hex number
     *
     * @param rgb {number[]}
     * @return {number} The color number
     */
    rgb2hex: function (rgb) {
        return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
    },

    /**
     * Checks whether the Canvas BlendModes are supported by the current browser
     *
     * @return {boolean} whether they are supported
     */
    canUseNewCanvasBlendModes: function () {
        if (typeof document === 'undefined') {
            return false;
        }

        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');

        canvas.width = 1;
        canvas.height = 1;

        context.fillStyle = '#000';
        context.fillRect(0, 0, 1, 1);

        context.globalCompositeOperation = 'multiply';

        context.fillStyle = '#fff';
        context.fillRect(0, 0, 1, 1);

        return context.getImageData(0,0,1,1).data[0] === 0;
    },

    /**
     * Given a number, this function returns the closest number that is a power of two
     * this function is taken from Starling Framework as its pretty neat ;)
     *
     * @param number {number}
     * @return {number} the closest number that is a power of two
     */
    getNextPowerOfTwo: function (number) {
        // see: http://en.wikipedia.org/wiki/Power_of_two#Fast_algorithm_to_check_if_a_positive_number_is_a_power_of_two
        if (number > 0 && (number & (number - 1)) === 0) {
            return number;
        }
        else {
            var result = 1;

            while (result < number) {
                result <<= 1;
            }

            return result;
        }
    },

    /**
     * checks if the given width and height make a power of two rectangle
     *
     * @param width {number}
     * @param height {number}
     * @return {boolean}
     */
    isPowerOfTwo: function (width, height) {
        return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set PIXI.utils.sayHello = false;
     *
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello: function (type) {
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            var args = [
                '%c %c %c Pixi.js ' + CONST.VERSION + ' - ' + type + '  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ ',
                'background: #ff66a5',
                'background: #ff66a5',
                'color: #ff66a5; background: #030307;',
                'background: #ff66a5',
                'background: #ffc3dc',
                'background: #ff66a5',
                'color: #ff2424; background: #fff',
                'color: #ff2424; background: #fff',
                'color: #ff2424; background: #fff'
            ];

            console.log.apply(console, args); //jshint ignore:line
        }
        else if (window.console) {
            console.log('Pixi.js ' + CONST.VERSION + ' - http://www.pixijs.com/'); //jshint ignore:line
        }

        utils.sayHello = false;
    },

    /**
     * A wrapper for ajax requests to be handled cross browser
     *
     * TODO: Replace this wil superagent
     *
     * @class
     * @namespace PIXI
     */
    AjaxRequest: function () {
        var activexmodes = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Microsoft.XMLHTTP']; //activeX versions to check for in IE

        if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
            for (var i=0; i<activexmodes.length; i++) {
                try{
                    return new window.ActiveXObject(activexmodes[i]);
                }
                catch(e) {
                    //suppress error
                }
            }
        }
        else if (window.XMLHttpRequest) // if Mozilla, Safari etc
        {
            return new window.XMLHttpRequest();
        }
        else {
            return false;
        }
    },

    PolyK:      require('./PolyK'),
    EventData:  require('./EventData'),
    EventTarget: require('./EventTarget'),

    // TODO: refactor out this
    AnimCache: {},
    FrameCache: {},
    TextureCache: {},
    TextureCacheIdGenerator: 0,
    BaseTextureCache: {},
    BaseTextureCacheIdGenerator: 0
};
