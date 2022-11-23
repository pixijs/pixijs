import { PRECISION } from '@pixi/constants';
import { BrowserAdapter } from './adapter';
import { isMobile } from './utils/isMobile';

import type { ENV, MIPMAP_MODES, WRAP_MODES, SCALE_MODES, MSAA_QUALITY, GC_MODES } from '@pixi/constants';
import type { ICanvas } from './ICanvas';
import type { IAdapter } from './adapter';

export interface IRenderOptions
{
    view: ICanvas;
    antialias: boolean;
    autoDensity: boolean;
    backgroundColor: number | string;
    background?: number | string;
    backgroundAlpha: number;
    premultipliedAlpha: boolean;
    /** @deprecated */
    useContextAlpha?: boolean | 'notMultiplied';
    clearBeforeRender: boolean;
    preserveDrawingBuffer: boolean;
    width: number;
    height: number;
    legacy: boolean;
    hello: boolean;
}

export interface ISettings
{
    ADAPTER: IAdapter;
    /** @deprecated */
    MIPMAP_TEXTURES?: MIPMAP_MODES;
    /** @deprecated */
    ANISOTROPIC_LEVEL?: number;
    RESOLUTION: number;
    /** @deprecated */
    FILTER_RESOLUTION?: number;
    /** @deprecated */
    FILTER_MULTISAMPLE?: MSAA_QUALITY;
    /** @deprecated */
    SPRITE_MAX_TEXTURES?: number;
    /** @deprecated */
    SPRITE_BATCH_SIZE?: number;
    RENDER_OPTIONS: IRenderOptions;
    /** @deprecated */
    GC_MODE?: GC_MODES;
    /** @deprecated */
    GC_MAX_IDLE?: number;
    /** @deprecated */
    GC_MAX_CHECK_COUNT?: number;
    /** @deprecated */
    WRAP_MODE?: WRAP_MODES;
    /** @deprecated */
    SCALE_MODE?: SCALE_MODES;
    PRECISION_VERTEX: PRECISION;
    PRECISION_FRAGMENT: PRECISION;
    /** @deprecated */
    CAN_UPLOAD_SAME_BUFFER?: boolean;
    CREATE_IMAGE_BITMAP: boolean;
    ROUND_PIXELS: boolean;
    RETINA_PREFIX?: RegExp;
    FAIL_IF_MAJOR_PERFORMANCE_CAVEAT?: boolean;
    /** @deprecated */
    UPLOADS_PER_FRAME?: number;
    /** @deprecated */
    SORTABLE_CHILDREN?: boolean;
    PREFER_ENV?: ENV;
    STRICT_TEXTURE_CACHE?: boolean;
    MESH_CANVAS_PADDING?: number;
    /** @deprecated */
    TARGET_FPMS?: number;
}

/**
 * User's customizable globals for overriding the default PIXI settings, such
 * as a renderer's default resolution, framerate, float precision, etc.
 * @example
 * // Use the native window resolution as the default resolution
 * // will support high-density displays when rendering
 * PIXI.settings.RESOLUTION = window.devicePixelRatio;
 *
 * // Disable interpolation when scaling, will make texture be pixelated
 * PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
 * @namespace PIXI.settings
 */
export const settings: ISettings = {
    /**
     * This adapter is used to call methods that are platform dependent.
     * For example `document.createElement` only runs on the web but fails in node environments.
     * This allows us to support more platforms by abstracting away specific implementations per platform.
     *
     * By default the adapter is set to work in the browser. However you can create your own
     * by implementing the `IAdapter` interface. See `IAdapter` for more information.
     * @name ADAPTER
     * @memberof PIXI.settings
     * @type {PIXI.IAdapter}
     * @default PIXI.BrowserAdapter
     */
    ADAPTER: BrowserAdapter,

    /**
     * Default resolution / device pixel ratio of the renderer.
     * @static
     * @name RESOLUTION
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    RESOLUTION: 1,

    /**
     * The default render options if none are supplied to {@link PIXI.Renderer}
     * or {@link PIXI.CanvasRenderer}.
     * @static
     * @name RENDER_OPTIONS
     * @memberof PIXI.settings
     * @type {object}
     * @property {PIXI.ICanvas} [view=null] -
     * @property {boolean} [antialias=false] -
     * @property {boolean} [autoDensity=false] -
     * @property {boolean} [premultipliedAlpha=true]  -
     * @property {number} [backgroundColor=0x000000] -
     * @property {number} [backgroundAlpha=1] -
     * @property {boolean} [clearBeforeRender=true] -
     * @property {boolean} [preserveDrawingBuffer=false] -
     * @property {number} [width=800] -
     * @property {number} [height=600] -
     * @property {boolean} [legacy=false] -
     * @property {boolean} [debug=false] -
     */
    RENDER_OPTIONS: {
        view: null,
        antialias: false,
        autoDensity: false,
        backgroundColor: 0x000000,
        backgroundAlpha: 1,
        premultipliedAlpha: true,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        width: 800,
        height: 600,
        legacy: false,
        hello: false,
    },

    /**
     * Default specify float precision in vertex shader.
     * @static
     * @name PRECISION_VERTEX
     * @memberof PIXI.settings
     * @type {PIXI.PRECISION}
     * @default PIXI.PRECISION.HIGH
     */
    PRECISION_VERTEX: PRECISION.HIGH,

    /**
     * Default specify float precision in fragment shader.
     * iOS is best set at highp due to https://github.com/pixijs/pixijs/issues/3742
     * @static
     * @name PRECISION_FRAGMENT
     * @memberof PIXI.settings
     * @type {PIXI.PRECISION}
     * @default PIXI.PRECISION.MEDIUM
     */
    PRECISION_FRAGMENT: isMobile.apple.device ? PRECISION.HIGH : PRECISION.MEDIUM,

    /**
     * Enables bitmap creation before image load. This feature is experimental.
     * @static
     * @name CREATE_IMAGE_BITMAP
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    CREATE_IMAGE_BITMAP: false,

    /**
     * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Advantages can include sharper image quality (like text) and faster rendering on canvas.
     * The main disadvantage is movement of objects may appear less smooth.
     * @static
     * @constant
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    ROUND_PIXELS: false,
};
