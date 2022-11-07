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
 * the browser then this function will return a canvas renderer
 * @memberof PIXI
 * @function autoDetectRenderer
 * @param {object} [options] - The optional renderer parameters
 * @param {number} [options.width=800] - the width of the renderers view
 * @param {number} [options.height=600] - the height of the renderers view
 * @param {PIXI.ICanvas} [options.view] - the canvas to use as a view, optional
 * @param {boolean} [options.useContextAlpha=true] - Pass-through value for canvas' context `alpha` property.
 *   If you want to set transparency, please use `backgroundAlpha`. This option is for cases where the
 *   canvas needs to be opaque, possibly for performance reasons on some older devices.
 * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
 *   resolutions other than 1
 * @param {boolean} [options.antialias=false] - sets antialias
 * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation, enable this if you
 *  need to call toDataUrl on the webgl context
 * @param {number|string} [options.backgroundColor=0x000000] - The background color of the rendered area
 *  (shown if not transparent). Also, accepts hex strings or color names (e.g., 'white').
 * @param {number|string} [options.background] - Alias for `options.backgroundColor`.
 * @param {number} [options.backgroundAlpha=1] - Value from 0 (fully transparent) to 1 (fully opaque).
 * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
 *   not before the new render pass.
 * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the renderer.
 * @param {boolean} [options.forceCanvas=false] - prevents selection of WebGL renderer, even if such is present, this
 *   option only is available when using **pixi.js-legacy** or **@pixi/canvas-renderer** modules, otherwise
 *   it is ignored.
 * @param {string} [options.powerPreference] - Parameter passed to webgl context, set to "high-performance"
 *  for devices with dual graphics card **webgl only**
 * @param {boolean} [options.hello=false] - Logs renderer type and version.
 * @returns {PIXI.Renderer|PIXI.CanvasRenderer} Returns WebGL renderer if available, otherwise CanvasRenderer
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
