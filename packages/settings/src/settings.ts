import { BrowserAdapter } from './adapter';

import type { IAdapter } from './adapter';
import type { ICanvas } from './ICanvas';

export interface IRenderOptions
{
    view: ICanvas;
    width: number;
    height: number;
    autoDensity: boolean;
    backgroundColor: number | string;
    background?: number | string;
    backgroundAlpha: number;
    /** @deprecated */
    useContextAlpha?: boolean | 'notMultiplied';
    clearBeforeRender: boolean;
    antialias: boolean;
    premultipliedAlpha: boolean;
    preserveDrawingBuffer: boolean;
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
     * @property {PIXI.ICanvas} [view=null] - {@link PIXI.IRendererOptions.view}
     * @property {number} [width=800] - {@link PIXI.IRendererOptions.width}
     * @property {number} [height=600] - {@link PIXI.IRendererOptions.height}
     * @property {boolean} [autoDensity=false] - {@link PIXI.IRendererOptions.autoDensity}
     * @property {number} [backgroundColor=0x000000] - {@link PIXI.IRendererOptions.backgroundColor}
     * @property {number} [backgroundAlpha=1] - {@link PIXI.IRendererOptions.backgroundAlpha}
     * @property {boolean} [clearBeforeRender=true] - {@link PIXI.IRendererOptions.clearBeforeRender}
     * @property {boolean} [antialias=false] - {@link PIXI.IRendererOptions.antialias}
     * @property {boolean} [premultipliedAlpha=true] - {@link PIXI.IRendererOptions.premultipliedAlpha}
     * @property {boolean} [preserveDrawingBuffer=false] - {@link PIXI.IRendererOptions.preserveDrawingBuffer}
     * @property {boolean} [hello=false] - {@link PIXI.IRendererOptions.hello}
     * @see PIXI.IRendererOptions
     */
    RENDER_OPTIONS: {
        view: null,
        width: 800,
        height: 600,
        autoDensity: false,
        backgroundColor: 0x000000,
        backgroundAlpha: 1,
        clearBeforeRender: true,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
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
