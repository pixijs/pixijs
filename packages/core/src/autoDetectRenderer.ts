import { extensions, ExtensionType } from '@pixi/extensions';

import type { ICanvas } from '@pixi/settings';
import type { IRenderer, IRendererOptions } from './IRenderer';

export interface IRendererOptionsAuto extends IRendererOptions
{
    forceCanvas?: boolean;
}

export interface IRendererConstructor<VIEW extends ICanvas = ICanvas>
{
    test(options?: IRendererOptionsAuto): boolean;
    new (options?: IRendererOptionsAuto): IRenderer<VIEW>;
}

/**
 * Collection of installed Renderers.
 * @ignore
 */
const renderers: IRendererConstructor<ICanvas>[] = [];

extensions.handleByList(ExtensionType.Renderer, renderers);

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If WebGL is not supported by
 * the browser then this function will return a canvas renderer.
 * @memberof PIXI
 * @function autoDetectRenderer
 * @param {PIXI.IRendererOptionsAuto} [options] - The optional renderer parameters.
 * @param {PIXI.ICanvas} [options.view=null] -
 *  The canvas to use as the view. If omitted, a new canvas will be created.
 * @param {number} [options.width=800] - The width of the renderer's view.
 * @param {number} [options.height=600] - The height of the renderer's view.
 * @param {number} [options.resolution=PIXI.settings.RESOLUTION] -
 *  The resolution / device pixel ratio of the renderer.
 * @param {boolean} [options.autoDensity=false] -
 *  Whether the CSS dimensions of the renderer's view should be resized automatically.
 * @param {number|string} [options.backgroundColor=0x000000] -
 *  The background color used to clear the canvas. It accepts hex numbers (e.g. `0xff0000`),
 *  hex strings (e.g. `'#f00'` or `'#ff0000'`) or color names (e.g. `'red'`).
 * @param {number|string} [options.background] - Alias for `options.backgroundColor`.
 * @param {number} [options.backgroundAlpha=1] -
 *  Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
 * @param {boolean|'notMultiplied'} [options.useContextAlpha=true] -
 *  **Deprecated since 7.0.0, use `premultipliedAlpha` and `backgroundAlpha` instead.** \
 *  Pass-through value for canvas' context attribute `alpha`. This option is for cases where the
 *  canvas needs to be opaque, possibly for performance reasons on some older devices.
 *  If you want to set transparency, please use `backgroundAlpha`. \
 *  **WebGL Only:** When set to `'notMultiplied'`, the canvas' context attribute `alpha` will be
 *  set to `true` and `premultipliedAlpha` will be to `false`.
 * @param {boolean} [options.clearBeforeRender=true] - Whether to clear the canvas before new render passes.
 * @param {PIXI.IRenderingContext} [options.context] - **WebGL Only.** User-provided WebGL rendering context object.
 * @param {boolean} [options.antialias=false] -
 *  **WebGL Only.** Whether to enable anti-aliasing. This may affect performance.
 * @param {string} [options.powerPreference] -
 *  **WebGL Only.** A hint indicating what configuration of GPU is suitable for the WebGL context,
 *  can be `'default'`, `'high-performance'` or `'low-power'`.
 *  Setting to `'high-performance'` will prioritize rendering performance over power consumption,
 *  while setting to `'low-power'` will prioritize power saving over rendering performance.
 * @param {boolean} [options.premultipliedAlpha=true] -
 *  **WebGL Only.** Whether the compositor will assume the drawing buffer contains colors with premultiplied alpha.
 * @param {boolean} [options.preserveDrawingBuffer=false] -
 *  **WebGL Only.** Whether to enable drawing buffer preservation. If enabled, the drawing buffer will preserve
 *  its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.
 * @param {boolean} [options.hello=false] - Whether to log the version and type information of renderer to console.
 * @param {boolean} [options.forceCanvas=false] -
 *  Force using {@link PIXI.CanvasRenderer}, even if WebGL is available. This option only is available when
 *  using **pixi.js-legacy** or **@pixi/canvas-renderer** packages, otherwise it will throw an error.
 * @returns Returns {@link PIXI.Renderer} if WebGL is available, otherwise {@link PIXI.CanvasRenderer}.
 */
export function autoDetectRenderer<VIEW extends ICanvas = ICanvas>(options?: IRendererOptionsAuto): IRenderer<VIEW>
{
    for (const RendererType of renderers)
    {
        if (RendererType.test(options))
        {
            return new RendererType(options) as IRenderer<VIEW>;
        }
    }

    throw new Error('Unable to auto-detect a suitable renderer.');
}
