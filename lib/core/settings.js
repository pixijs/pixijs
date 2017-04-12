'use strict';

exports.__esModule = true;

var _maxRecommendedTextures = require('./utils/maxRecommendedTextures');

var _maxRecommendedTextures2 = _interopRequireDefault(_maxRecommendedTextures);

var _canUploadSameBuffer = require('./utils/canUploadSameBuffer');

var _canUploadSameBuffer2 = _interopRequireDefault(_canUploadSameBuffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * User's customizable globals for overriding the default PIXI settings, such
 * as a renderer's default resolution, framerate, float percision, etc.
 * @example
 * // Use the native window resolution as the default resolution
 * // will support high-density displays when rendering
 * PIXI.settings.RESOLUTION = window.devicePixelRatio.
 *
 * // Disable interpolation when scaling, will make texture be pixelated
 * PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
 * @namespace PIXI.settings
 */
exports.default = {

  /**
   * Target frames per millisecond.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 0.06
   */
  TARGET_FPMS: 0.06,

  /**
   * If set to true WebGL will attempt make textures mimpaped by default.
   * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
   *
   * @static
   * @memberof PIXI.settings
   * @type {boolean}
   * @default true
   */
  MIPMAP_TEXTURES: true,

  /**
   * Default resolution / device pixel ratio of the renderer.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 1
   */
  RESOLUTION: 1,

  /**
   * Default filter resolution.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 1
   */
  FILTER_RESOLUTION: 1,

  /**
   * The maximum textures that this device supports.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 32
   */
  SPRITE_MAX_TEXTURES: (0, _maxRecommendedTextures2.default)(32),

  // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
  // TODO: maybe add PARTICLE.BATCH_SIZE: 15000

  /**
   * The default sprite batch size.
   *
   * The default aims to balance desktop and mobile devices.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 4096
   */
  SPRITE_BATCH_SIZE: 4096,

  /**
   * The prefix that denotes a URL is for a retina asset.
   *
   * @static
   * @memberof PIXI.settings
   * @type {RegExp}
   * @example `@2x`
   * @default /@([0-9\.]+)x/
   */
  RETINA_PREFIX: /@([0-9\.]+)x/,

  /**
   * The default render options if none are supplied to {@link PIXI.WebGLRenderer}
   * or {@link PIXI.CanvasRenderer}.
   *
   * @static
   * @constant
   * @memberof PIXI.settings
   * @type {object}
   * @property {HTMLCanvasElement} view=null
   * @property {number} resolution=1
   * @property {boolean} antialias=false
   * @property {boolean} forceFXAA=false
   * @property {boolean} autoResize=false
   * @property {boolean} transparent=false
   * @property {number} backgroundColor=0x000000
   * @property {boolean} clearBeforeRender=true
   * @property {boolean} preserveDrawingBuffer=false
   * @property {boolean} roundPixels=false
   * @property {number} width=800
   * @property {number} height=600
   * @property {boolean} legacy=false
   */
  RENDER_OPTIONS: {
    view: null,
    antialias: false,
    forceFXAA: false,
    autoResize: false,
    transparent: false,
    backgroundColor: 0x000000,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    roundPixels: false,
    width: 800,
    height: 600,
    legacy: false
  },

  /**
   * Default transform type.
   *
   * @static
   * @memberof PIXI.settings
   * @type {PIXI.TRANSFORM_MODE}
   * @default PIXI.TRANSFORM_MODE.STATIC
   */
  TRANSFORM_MODE: 0,

  /**
   * Default Garbage Collection mode.
   *
   * @static
   * @memberof PIXI.settings
   * @type {PIXI.GC_MODES}
   * @default PIXI.GC_MODES.AUTO
   */
  GC_MODE: 0,

  /**
   * Default Garbage Collection max idle.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 3600
   */
  GC_MAX_IDLE: 60 * 60,

  /**
   * Default Garbage Collection maximum check count.
   *
   * @static
   * @memberof PIXI.settings
   * @type {number}
   * @default 600
   */
  GC_MAX_CHECK_COUNT: 60 * 10,

  /**
   * Default wrap modes that are supported by pixi.
   *
   * @static
   * @memberof PIXI.settings
   * @type {PIXI.WRAP_MODES}
   * @default PIXI.WRAP_MODES.CLAMP
   */
  WRAP_MODE: 0,

  /**
   * The scale modes that are supported by pixi.
   *
   * @static
   * @memberof PIXI.settings
   * @type {PIXI.SCALE_MODES}
   * @default PIXI.SCALE_MODES.LINEAR
   */
  SCALE_MODE: 0,

  /**
   * Default specify float precision in vertex shader.
   *
   * @static
   * @memberof PIXI.settings
   * @type {PIXI.PRECISION}
   * @default PIXI.PRECISION.HIGH
   */
  PRECISION_VERTEX: 'highp',

  /**
   * Default specify float precision in fragment shader.
   *
   * @static
   * @memberof PIXI.settings
   * @type {PIXI.PRECISION}
   * @default PIXI.PRECISION.MEDIUM
   */
  PRECISION_FRAGMENT: 'mediump',

  /**
   * Can we upload the same buffer in a single frame?
   *
   * @static
   * @constant
   * @memberof PIXI
   * @type {boolean}
   */
  CAN_UPLOAD_SAME_BUFFER: (0, _canUploadSameBuffer2.default)()

};
//# sourceMappingURL=settings.js.map