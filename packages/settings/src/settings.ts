import { BrowserAdapter } from './adapter';

import type { IAdapter } from './adapter';
import type { ICanvas } from './ICanvas';

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

interface ISettings
{
    ADAPTER: IAdapter;
    RESOLUTION: number;
    RENDER_OPTIONS: IRenderOptions;
    CREATE_IMAGE_BITMAP: boolean;
    ROUND_PIXELS: boolean;
}

/**
 * User's customizable globals for overriding the default PIXI settings, such
 * as a renderer's default resolution, framerate, float precision, etc.
 * @example
 * import { settings, ENV } from 'pixi.js';
 *
 * // Use the native window resolution as the default resolution
 * // will support high-density displays when rendering
 * settings.RESOLUTION = window.devicePixelRatio;
 *
 * // Used for older v1 WebGL devices for backwards compatibility
 * settings.PREFER_ENV = ENV.WEBGL_LEGACY;
 * @namespace PIXI.settings
 */
export const settings: ISettings & Partial<GlobalMixins.Settings> = {
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
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    ROUND_PIXELS: false,
};
