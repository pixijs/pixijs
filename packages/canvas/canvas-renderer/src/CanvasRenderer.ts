import { RenderTexture, BaseRenderTexture, IRenderableObject } from '@pixi/core';
import { CanvasMaskSystem } from './CanvasMaskSystem';
import { RENDERER_TYPE, SCALE_MODES } from '@pixi/constants';
import { Matrix, Rectangle } from '@pixi/math';

import type { DisplayObject } from '@pixi/display';
import type {
    IRendererOptions,
    IRendererPlugin,
    IRendererPlugins,
    IRendererRenderOptions
} from '@pixi/core';
import { IRenderer } from 'packages/core/src/IRenderer';
import { GenerateTextureSystem, IGenerateTextureOptions } from 'packages/core/src/renderTexture/GenerateTextureSystem';
import { BackgroundSystem } from 'packages/core/src/background/BackgroundSystem';
import { ViewSystem } from 'packages/core/src/view/ViewSystem';
import { PluginSystem } from 'packages/core/src/plugin/PluginSystem';
import { SystemManager } from 'packages/core/src/system/SystemManager';
import { CanvasContextSystem } from './CanvasContextSystem';
import { CanvasRenderSystem } from './CanvasRenderSystem';
import { StartupOptions, StartupSystem } from 'packages/core/src/startup/StartupSystem';
import { settings } from '@pixi/settings';
import { deprecation } from '@pixi/utils';

export interface ICanvasRendererPluginConstructor {
    new (renderer: CanvasRenderer, options?: any): IRendererPlugin;
}

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas.
 *
 * This renderer should be used for browsers that do not support WebGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything!
 *
 * @class
 * @memberof PIXI
 * @implements PIXI.IRenderer
 */
export class CanvasRenderer extends SystemManager<CanvasRenderer> implements IRenderer
{
    /**
     * Fired after rendering finishes.
     * @event PIXI.CanvasRenderer#postrender
     */
    /**
     * Fired before rendering starts.
     * @event PIXI.CanvasRenderer#prerender
     */

    // systems..
    /**
     * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
     * @member {PIXI.CanvasMaskManager}
     */
    public textureGenerator: GenerateTextureSystem;
    public background: BackgroundSystem;
    public mask: CanvasMaskSystem;
    public _view: ViewSystem;
     public _plugin: PluginSystem;
     public context: CanvasContextSystem;
     public _renderer: CanvasRenderSystem;
     public startup: StartupSystem;

     public type: RENDERER_TYPE;
     public readonly rendererLogId = 'Canvas';

     /**
     * @param options - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.useContextAlpha=true] - Pass-through value for canvas' context `alpha` property.
     *   If you want to set transparency, please use `backgroundAlpha`. This option is for cases where the
     *   canvas needs to be opaque, possibly for performance reasons on some older devices.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1
     * @param {boolean} [options.antialias=false] - sets antialias
     * @param {number} [options.resolution=PIXI.settings.RESOLUTION] - The resolution / device pixel ratio of the renderer.
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the webgl context.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
     *      not before the new render pass.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     * @param {number} [options.backgroundAlpha=1] - Value from 0 (fully transparent) to 1 (fully opaque).
     */
     constructor(options?: IRendererOptions)
     {
         super();

         // Add the default render options
         options = Object.assign({}, settings.RENDER_OPTIONS, options);

         this.type = RENDERER_TYPE.CANVAS;

         const systemConfig = {
             runners: ['init', 'destroy', 'contextChange', 'reset', 'update', 'postrender', 'prerender', 'resize'],
             systems: {
                 // systems shared by all renderers..
                 textureGenerator: GenerateTextureSystem,
                 background: BackgroundSystem,
                 _view: ViewSystem,
                 _plugin: PluginSystem,
                 startup: StartupSystem,

                 // canvas systems..
                 mask: CanvasMaskSystem,
                 context: CanvasContextSystem,
                 _renderer: CanvasRenderSystem,

             }
         };

         this.setup(systemConfig);

         // new options!
         const startupOptions: StartupOptions = {
             _plugin: CanvasRenderer.__plugins,
             background: {
                 backgroundAlpha: options.backgroundAlpha,
                 backgroundColor: options.backgroundColor,
                 clearBeforeRender: options.clearBeforeRender,

             },
             _view: {
                 height: options.height,
                 width: options.width,
                 autoDensity: options.autoDensity,
                 resolution: options.resolution,
             }
         };

         this.startup.run(startupOptions);
     }

     generateTexture(displayObject: IRenderableObject,
         options: IGenerateTextureOptions | SCALE_MODES = {},
         resolution?: number, region?: Rectangle): RenderTexture
     {
         // @deprecated parameters spread, use options instead
         if (typeof options === 'number')
         {
             // #if _DEBUG
             deprecation('6.1.0', 'generateTexture options (scaleMode, resolution, region) are now object options.');
             // #endif

             options = { scaleMode: options, resolution, region };
         }

         return this.textureGenerator.generateTexture(displayObject, options);
     }

     reset(): void
     {
         // nothing to be done :D
     }

     /**
     * Renders the object to its WebGL view.
     *
     * @param displayObject - The object to be rendered.
     * @param options - Object to use for render options.
     * @param {PIXI.RenderTexture} [options.renderTexture] - The render texture to render to.
     * @param {boolean} [options.clear=true] - Should the canvas be cleared before the new render.
     * @param {PIXI.Matrix} [options.transform] - A transform to apply to the render texture before rendering.
     * @param {boolean} [options.skipUpdateTransform=false] - Should we skip the update transform pass?
     */
     render(displayObject: DisplayObject, options?: IRendererRenderOptions): void;

     /**
     * Please use the `option` render arguments instead.
     *
     * @deprecated Since 6.0.0
     * @param displayObject - The object to be rendered.
     * @param renderTexture - The render texture to render to.
     * @param clear - Should the canvas be cleared before the new render.
     * @param transform - A transform to apply to the render texture before rendering.
     * @param skipUpdateTransform - Should we skip the update transform pass?
     */
     render(displayObject: DisplayObject, renderTexture?: RenderTexture | BaseRenderTexture,
        clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean): void;

     /** @ignore */
     public render(displayObject: DisplayObject, options?: IRendererRenderOptions | RenderTexture | BaseRenderTexture): void
     {
         this._renderer.render(displayObject, options);
     }

     /**
     * Clear the canvas of renderer.
     *
     * @param {string} [clearColor] - Clear the canvas with this color, except the canvas is transparent.
     * @param {number} [alpha] - Alpha to apply to the background fill color.
     */
     public clear(): void
     {
         this.context.clear();
     }

     /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
     public destroy(removeView?: boolean): void
     {
         this.runners.destroy.items.reverse();

         this.emitWithCustomOptions(this.runners.destroy, {
             _view: removeView,
         });

         super.destroy();
     }

     get plugins(): IRendererPlugins
     {
         return this._plugin.plugins;
     }

     /**
     * Resizes the canvas view to the specified width and height.
     *
     * @implements PIXI.IRenderer#resize
     *
     * @param desiredScreenWidth - the desired width of the screen
     * @param desiredScreenHeight - the desired height of the screen
     */
     public resize(desiredScreenWidth: number, desiredScreenHeight: number): void
     {
         this._view.resizeView(desiredScreenWidth, desiredScreenHeight);
     }

     /**
     * Same as view.width, actual number of pixels in the canvas by horizontal.
     *
     * @member {number}
     * @readonly
     * @default 800
     */
     get width(): number
     {
         return this._view.view.width;
     }

     /**
     * Same as view.height, actual number of pixels in the canvas by vertical.
     *
     * @member {number}
     * @readonly
     * @default 600
     */
     get height(): number
     {
         return this._view.view.height;
     }

     get resolution(): number
     {
         return this._view.resolution;
     }

     get autoDensity(): boolean
     {
         return this._view.autoDensity;
     }

     get view(): HTMLCanvasElement
     {
         return this._view.view;
     }

     get screen(): Rectangle
     {
         return this._view.screen;
     }

     get lastObjectRendered(): IRenderableObject
     {
         return this._renderer.lastObjectRendered;
     }

     get renderingToScreen(): boolean
     {
         return this._renderer.renderingToScreen;
     }

    static __plugins: IRendererPlugins;

    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @member {object} plugins
     * @readonly
     * @property {PIXI.AccessibilityManager} accessibility Support tabbing interactive elements.
     * @property {PIXI.CanvasExtract} extract Extract image data from renderer.
     * @property {PIXI.InteractionManager} interaction Handles mouse, touch and pointer events.
     * @property {PIXI.CanvasPrepare} prepare Pre-render display objects.
     */

    /**
     * Adds a plugin to the renderer.
     *
     * @param pluginName - The name of the plugin.
     * @param ctor - The constructor function or class for the plugin.
     */
    static registerPlugin(pluginName: string, ctor: ICanvasRendererPluginConstructor): void
    {
        CanvasRenderer.__plugins = CanvasRenderer.__plugins || {};
        CanvasRenderer.__plugins[pluginName] = ctor;
    }
}
