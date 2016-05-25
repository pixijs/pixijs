
/**
 * Constant values used in pixi
 *
 * @lends PIXI
 */
var CONST = {
    /**
     * String of the current PIXI version.
     *
     * @static
     * @constant
     * @property {string} VERSION
     */
    VERSION: '__VERSION__',

    /**
     * Two Pi.
     *
     * @property {number} PI_2
     * @constant
     * @static
     */
    PI_2: Math.PI * 2,

    /**
     * Conversion factor for converting radians to degrees.
     *
     * @property {number} RAD_TO_DEG
     * @constant
     * @static
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * Conversion factor for converting degrees to radians.
     *
     * @property {number} DEG_TO_RAD
     * @constant
     * @static
     */
    DEG_TO_RAD: Math.PI / 180,

    /**
     * Target frames per millisecond.
     *
     * @static
     * @constant
     * @property {number} TARGET_FPMS=0.06
     */
    TARGET_FPMS: 0.06,

    /**
     * Constant to identify the Renderer Type.
     *
     * @static
     * @constant
     * @property {object} RENDERER_TYPE
     * @property {number} RENDERER_TYPE.UNKNOWN
     * @property {number} RENDERER_TYPE.WEBGL
     * @property {number} RENDERER_TYPE.CANVAS
     */
    RENDERER_TYPE: {
        UNKNOWN:    0,
        WEBGL:      1,
        CANVAS:     2
    },

    /**
     * Various blend modes supported by PIXI.
     *
     * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
     * Anything else will silently act like NORMAL.
     *
     * @static
     * @constant
     * @property {object} BLEND_MODES
     * @property {number} BLEND_MODES.NORMAL
     * @property {number} BLEND_MODES.ADD
     * @property {number} BLEND_MODES.MULTIPLY
     * @property {number} BLEND_MODES.SCREEN
     * @property {number} BLEND_MODES.OVERLAY
     * @property {number} BLEND_MODES.DARKEN
     * @property {number} BLEND_MODES.LIGHTEN
     * @property {number} BLEND_MODES.COLOR_DODGE
     * @property {number} BLEND_MODES.COLOR_BURN
     * @property {number} BLEND_MODES.HARD_LIGHT
     * @property {number} BLEND_MODES.SOFT_LIGHT
     * @property {number} BLEND_MODES.DIFFERENCE
     * @property {number} BLEND_MODES.EXCLUSION
     * @property {number} BLEND_MODES.HUE
     * @property {number} BLEND_MODES.SATURATION
     * @property {number} BLEND_MODES.COLOR
     * @property {number} BLEND_MODES.LUMINOSITY
     */
    BLEND_MODES: {
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
     * Various webgl draw modes. These can be used to specify which GL drawMode to use
     * under certain situations and renderers.
     *
     * @static
     * @constant
     * @property {object} DRAW_MODES
     * @property {number} DRAW_MODES.POINTS
     * @property {number} DRAW_MODES.LINES
     * @property {number} DRAW_MODES.LINE_LOOP
     * @property {number} DRAW_MODES.LINE_STRIP
     * @property {number} DRAW_MODES.TRIANGLES
     * @property {number} DRAW_MODES.TRIANGLE_STRIP
     * @property {number} DRAW_MODES.TRIANGLE_FAN
     */
    DRAW_MODES: {
        POINTS:         0,
        LINES:          1,
        LINE_LOOP:      2,
        LINE_STRIP:     3,
        TRIANGLES:      4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN:   6
    },

    /**
     * The scale modes that are supported by pixi.
     *
     * The DEFAULT scale mode affects the default scaling mode of future operations.
     * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
     *
     * @static
     * @constant
     * @property {object} SCALE_MODES
     * @property {number} SCALE_MODES.DEFAULT=LINEAR
     * @property {number} SCALE_MODES.LINEAR Smooth scaling
     * @property {number} SCALE_MODES.NEAREST Pixelating scaling
     */
    SCALE_MODES: {
        DEFAULT:    0,
        LINEAR:     0,
        NEAREST:    1
    },

    /**
     * The wrap modes that are supported by pixi.
     *
     * The DEFAULT wrap mode affects the default wraping mode of future operations.
     * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
     * If the texture is non power of two then clamp will be used regardless as webGL can only use REPEAT if the texture is po2.
     * This property only affects WebGL.
     *
     * @static
     * @constant
     * @property {object} WRAP_MODES
     * @property {number} WRAP_MODES.DEFAULT=CLAMP
     * @property {number} WRAP_MODES.CLAMP The textures uvs are clamped
     * @property {number} WRAP_MODES.REPEAT The texture uvs tile and repeat
     * @property {number} WRAP_MODES.MIRRORED_REPEAT The texture uvs tile and repeat with mirroring
     */
    WRAP_MODES: {
        DEFAULT:        0,
        CLAMP:          0,
        REPEAT:         1,
        MIRRORED_REPEAT:2
    },

    /**
     * The gc modes that are supported by pixi.
     *
     * The DEFAULT Garbage Collection mode for pixi textures is MANUAL
     * If set to DEFAULT, the renderer will occasianally check textures usage. If they are not used for a specified period of time they will be removed from the GPU.
     * They will of corse be uploaded again when they are required. This is a silent behind the scenes process that should ensure that the GPU does not  get filled up.
     * Handy for mobile devices!
     * This property only affects WebGL
     * Handy for mobile devices!
     * This property only affects WebGL.
     *
     * @static
     * @constant
     * @property {object} GC_MODES
     * @property {number} GC_MODES.DEFAULT=DEFAULT
     * @property {number} GC_MODES.AUTO Garbage collection will happen periodically automatically
     * @property {number} GC_MODES.MANUAL Garbage collection will need to be called manually
     */
    GC_MODES: {
        DEFAULT:        1,
        AUTO:           0,
        MANUAL:         1,
    },

    /**
     * If set to true WebGL will attempt make textures mimpaped by default.
     * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
     *
     * @static
     * @constant
     * @property {bool} MIPMAP_TEXTURES
     */
    MIPMAP_TEXTURES:true,

    /**
     * The prefix that denotes a URL is for a retina asset.
     *
     * @static
     * @constant
     * @property {string} RETINA_PREFIX
     * @example `@2x`
     */
    RETINA_PREFIX: /@(.+)x/,

    /**
     * Default resolution of the renderer.
     *
     * @property {number} RESOLUTION
     * @constant
     * @static
     */
    RESOLUTION:1,

    /**
     * Default filter resolution.
     *
     * @property {number} FILTER_RESOLUTION
     * @constant
     * @static
     */
    FILTER_RESOLUTION:1,

    /**
     * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @static
     * @constant
     * @property {object} DEFAULT_RENDER_OPTIONS
     * @property {HTMLCanvasElement} DEFAULT_RENDER_OPTIONS.view=null
     * @property {number} DEFAULT_RENDER_OPTIONS.resolution=1
     * @property {boolean} DEFAULT_RENDER_OPTIONS.antialias=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.forceFXAA=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.autoResize=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.transparent=false
     * @property {number} DEFAULT_RENDER_OPTIONS.backgroundColor=0x000000
     * @property {boolean} DEFAULT_RENDER_OPTIONS.clearBeforeRender=true
     * @property {boolean} DEFAULT_RENDER_OPTIONS.preserveDrawingBuffer=false
     * @property {boolean} DEFAULT_RENDER_OPTIONS.roundPixels=false
     */
    DEFAULT_RENDER_OPTIONS: {
        view: null,
        resolution: 1,
        antialias: false,
        forceFXAA: false,
        autoResize: false,
        transparent: false,
        backgroundColor: 0x000000,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        roundPixels: false
    },

    /**
     * Constants that identify shapes, mainly to prevent `instanceof` calls.
     *
     * @static
     * @constant
     * @property {object} SHAPES
     * @property {number} SHAPES.POLY=0
     * @property {number} SHAPES.RECT=1
     * @property {number} SHAPES.CIRC=2
     * @property {number} SHAPES.ELIP=3
     * @property {number} SHAPES.RREC=4
     */
    SHAPES: {
        POLY: 0,
        RECT: 1,
        CIRC: 2,
        ELIP: 3,
        RREC: 4
    },

    /**
     * Constants that specify float precision in shaders.
     *
     * @static
     * @constant
     * @property {object} PRECISION
     * @property {number} PRECISION.DEFAULT='mediump'
     * @property {number} PRECISION.LOW='lowp'
     * @property {number} PRECISION.MEDIUM='mediump'
     * @property {number} PRECISION.HIGH='highp'
     */
    PRECISION: {
        DEFAULT: 'mediump',
        LOW: 'lowp',
        MEDIUM: 'mediump',
        HIGH: 'highp'
    },

    // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
    // TODO: maybe add PARTICLE.BATCH_SIZE: 15000
    SPRITE_BATCH_SIZE: 4096, //nice balance between mobile and desktop machines
    SPRITE_MAX_TEXTURES: require('./utils/maxRecommendedTextures')(32), //this is the MAXIMUM - various gpus will have there own limits.
    TEXT_STYLE_CHANGED: 'changed' //Name of the event that fires when a text style is changed
};

module.exports = CONST;
