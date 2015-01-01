/**
 * Constant values used in pixi
 *
 * @mixin const
 */
module.exports = {
    /**
     * Constant to identify the WEBGL Renderer Type
     *
     * @static
     * @constant
     * @property {number} WEBGL_RENDERER
     */
    WEBGL_RENDERER: 1,

    /**
     * Constant to identify the CANVAS Renderer Type
     *
     * @static
     * @constant
     * @property {number} CANVAS_RENDERER
     */
    CANVAS_RENDERER: 2,

    /**
     * String of the current PIXI version
     *
     * @static
     * @constant
     * @property {string} VERSION
     */
    VERSION: require('../../package.json').version,

    /**
     * Various blend modes supported by PIXI. IMPORTANT - The WebGL renderer only supports
     * the NORMAL, ADD, MULTIPLY and SCREEN blend modes. Anything else will silently act like
     * NORMAL.
     *
     * @static
     * @constant
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
     * @static
     * @constant
     * @property {object} scaleModes
     * @property {number} scaleModes.DEFAULT=LINEAR
     * @property {number} scaleModes.LINEAR Smooth scaling
     * @property {number} scaleModes.NEAREST Pixelating scaling
     */
    scaleModes: {
        DEFAULT:    0,
        LINEAR:     0,
        NEAREST:    1
    },

    /**
     * The prefix that denotes a URL is for a retina asset
     *
     * @static
     * @constant
     * @property {string} RETINA_PREFIX
     */
    RETINA_PREFIX: '@2x',

    /**
     * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @static
     * @constant
     * @property {object} defaultRenderOptions
     * @property {HTMLCanvasElement} defaultRenderOptions.view=null
     * @property {boolean} defaultRenderOptions.transparent=false
     * @property {boolean} defaultRenderOptions.antialias=false
     * @property {boolean} defaultRenderOptions.preserveDrawingBuffer=false
     * @property {number} defaultRenderOptions.resolution=1
     * @property {number} defaultRenderOptions.backgroundColor=0x000000
     * @property {boolean} defaultRenderOptions.clearBeforeRender=true
     * @property {boolean} defaultRenderOptions.autoResize=false
     */
    defaultRenderOptions: {
        view: null,
        resolution: 1,
        antialias: false,
        autoResize: false,
        transparent: false,
        backgroundColor: 0x000000,
        clearBeforeRender: true,
        preserveDrawingBuffer: false
    },

    /**
     * Constants that identify shapes, mainly to prevent `instanceof` calls.
     *
     * @static
     * @constant
     * @property {object} SHAPES
     * @property {object} SHAPES.POLY=0
     * @property {object} SHAPES.RECT=1
     * @property {object} SHAPES.CIRC=2
     * @property {object} SHAPES.ELIP=3
     * @property {object} SHAPES.RREC=4
     */
    SHAPES: {
        POLY: 0,
        RECT: 1,
        CIRC: 2,
        ELIP: 3,
        RREC: 4
    }
};
