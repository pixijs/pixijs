import { BrowserAdapter } from './adapter/adapter';

import type { Adapter } from './adapter/adapter';

interface Settings
{
    ADAPTER: Adapter;
    RETINA_PREFIX: RegExp;
    FAIL_IF_MAJOR_PERFORMANCE_CAVEAT: boolean;
    RESOLUTION: number;
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
 * @namespace PIXI.settings
 */
const settings: Settings & Partial<PixiMixins.Settings> = {
    /**
     * This adapter is used to call methods that are platform dependent.
     * For example `document.createElement` only runs on the web but fails in node environments.
     * This allows us to support more platforms by abstracting away specific implementations per platform.
     *
     * By default the adapter is set to work in the browser. However you can create your own
     * by implementing the `IAdapter` interface. See `IAdapter` for more information.
     * @name ADAPTER
     * @memberof PIXI.settings
     * @type {PIXI.Adapter}
     * @default PIXI.BrowserAdapter
     */
    ADAPTER: BrowserAdapter,

    /**
     * The prefix that denotes a URL is for a retina asset.
     * @static
     * @name RETINA_PREFIX
     * @memberof PIXI.settings
     * @type {RegExp}
     * @default /@([0-9\.]+)x/
     * @example `@2x`
     */
    RETINA_PREFIX: /@([0-9\.]+)x/,

    /**
     * Should the `failIfMajorPerformanceCaveat` flag be enabled as a context option used in the `isWebGLSupported` function.
     * If set to true, a WebGL renderer can fail to be created if the browser thinks there could be performance issues when
     * using WebGL.
     *
     * In PixiJS v6 this has changed from true to false by default, to allow WebGL to work in as many scenarios as possible.
     * However, some users may have a poor experience, for example, if a user has a gpu or driver version blacklisted by the
     * browser.
     *
     * If your application requires high performance rendering, you may wish to set this to false.
     * We recommend one of two options if you decide to set this flag to false:
     *
     * 1: Use the `pixi.js-legacy` package, which includes a Canvas renderer as a fallback in case high performance WebGL is
     *    not supported.
     *
     * 2: Call `isWebGLSupported` (which if found in the PIXI.utils package) in your code before attempting to create a
     *    PixiJS renderer, and show an error message to the user if the function returns false, explaining that their
     *    device & browser combination does not support high performance WebGL.
     *    This is a much better strategy than trying to create a PixiJS renderer and finding it then fails.
     * @static
     * @name FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    FAIL_IF_MAJOR_PERFORMANCE_CAVEAT: false,

    /**
     * Default resolution / device pixel ratio of the renderer.
     * @static
     * @name RESOLUTION
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    RESOLUTION: 1,
};

export { settings };
