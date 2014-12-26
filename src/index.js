/* global PIXI:true */
/**
 * @file        Main export of the PIXI library
 * @namespace   PIXI
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */
var PIXI = {
    math: require('./math'),

    /**
     * Constant to identify the WEBGL Renderer Type
     *
     * @property {number} WEBGL_RENDERER
     * @constant
     * @static
     */
    WEBGL_RENDERER: 1,

    /**
     * Constant to identify the CANVAS Renderer Type
     *
     * @property {number} CANVAS_RENDERER
     * @constant
     * @static
     */
    CANVAS_RENDERER: 2,

    /**
     * String of the current PIXI version
     *
     * @property {string} VERSION
     * @constant
     * @static
     */
    VERSION: require('../package.json').version,

    /**
     * Various blend modes supported by PIXI. IMPORTANT - The WebGL renderer only supports
     * the NORMAL, ADD, MULTIPLY and SCREEN blend modes. Anything else will silently act like
     * NORMAL.
     *
     * @property {object} blendModes
     * @property {number} blendModes.NORMAL
     * @property {number} blendModes.ADD
     * @property {number} blendModes.MULTIPLY
     * @property {number} blendModes.SCREEN
     * @property {number} blendModes.OVERLAY
     * @property {number} blendModes.DARKEN
     * @property {number} blendModes.LIGHTEN
     * @property {number} blendModes.COLOR_DODGE
     * @property {number} blendModes.COLOR_BURN
     * @property {number} blendModes.HARD_LIGHT
     * @property {number} blendModes.SOFT_LIGHT
     * @property {number} blendModes.DIFFERENCE
     * @property {number} blendModes.EXCLUSION
     * @property {number} blendModes.HUE
     * @property {number} blendModes.SATURATION
     * @property {number} blendModes.COLOR
     * @property {number} blendModes.LUMINOSITY
     * @constant
     * @static
     */
    blendModes: {
        NORMAL:         0,
        ADD:            1,
        MULTIPLY:       2,
        SCREEN:         3,
        OVERLAY:        4,
        DARKEN:         5,
        LIGHTEN:        6,
        COLOR_DODGE:    7,
        COLOR_BURN:     8,
        HARD_LIGHT:     9,
        SOFT_LIGHT:     10,
        DIFFERENCE:     11,
        EXCLUSION:      12,
        HUE:            13,
        SATURATION:     14,
        COLOR:          15,
        LUMINOSITY:     16
    },

    /**
     * The scale modes that are supported by pixi.
     *
     * The DEFAULT scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @property {object} scaleModes
     * @property {number} scaleModes.DEFAULT=LINEAR
     * @property {number} scaleModes.LINEAR Smooth scaling
     * @property {number} scaleModes.NEAREST Pixelating scaling
     * @constant
     * @static
     */
    scaleModes: {
        DEFAULT:    0,
        LINEAR:     0,
        NEAREST:    1
    },

    /**
     * The prefix that denotes a URL is for a retina asset
     *
     * @property {string} RETINA_PREFIX
     * @constant
     * @static
     */
    RETINA_PREFIX: '@2x',

    /**
     * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @property {object} defaultRenderOptions
     * @property {HTMLCanvasElement} defaultRenderOptions.view=null
     * @property {boolean} defaultRenderOptions.transparent=false
     * @property {boolean} defaultRenderOptions.antialias=false
     * @property {boolean} defaultRenderOptions.preserveDrawingBuffer=false
     * @property {number} defaultRenderOptions.resolution=1
     * @property {boolean} defaultRenderOptions.clearBeforeRender=true
     * @property {boolean} defaultRenderOptions.autoResize=false
     * @constant
     * @static
     */
    defaultRenderOptions: {
        view: null,
        resolution: 1,
        antialias: false,
        autoResize: false,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false
    },

    /**
     * Logs out the version and renderer information for this running instance of PIXI.
     * If you don't want to see this message you can set PIXI.sayHello = false;
     *
     * @param {string} type - The string renderer type to log.
     * @constant
     * @static
     */
    sayHello: function (type) {
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            var args = [
                '%c %c %c Pixi.js ' + PIXI.VERSION + ' - ' + type + '  %c ' + ' %c ' + ' http://www.pixijs.com/  %c %c ♥%c♥%c♥ ',
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

            console.log.apply(console, args);
        }
        else if (window['console']) {
            console.log('Pixi.js ' + PIXI.VERSION + ' - http://www.pixijs.com/');
        }

        PIXI.sayHello = false;
    }
};

module.exports = PIXI;

/*************
 * TODO:
 *************/
// used to create uids for various pixi objects..
PIXI._UID = 0;

if(typeof(Float32Array) != 'undefined')
{
    PIXI.Float32Array = Float32Array;
    PIXI.Uint16Array = Uint16Array;

    // Uint32Array and ArrayBuffer only used by WebGL renderer
    // We can suppose that if WebGL is supported then typed arrays are supported too
    // as they predate WebGL support for all browsers:
    // see typed arrays support: http://caniuse.com/#search=TypedArrays
    // see WebGL support: http://caniuse.com/#search=WebGL
    PIXI.Uint32Array = Uint32Array;
    PIXI.ArrayBuffer = ArrayBuffer;
}
else
{
    PIXI.Float32Array = Array;
    PIXI.Uint16Array = Array;
}

// interaction frequency
PIXI.INTERACTION_FREQUENCY = 30;
PIXI.AUTO_PREVENT_DEFAULT = true;
