import { AbstractRenderer, CanvasResource, OffscreenContext } from '@pixi/core';
import { CanvasRenderTarget, sayHello, rgb2hex, hex2string } from '@pixi/utils';
import { CanvasMaskManager } from './utils/CanvasMaskManager';
import { mapCanvasBlendModesToPixi } from './utils/mapCanvasBlendModesToPixi';
import { RENDERER_TYPE, SCALE_MODES, BLEND_MODES } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { Matrix } from '@pixi/math';

import type { DisplayObject } from '@pixi/display';
import type {
    IRendererOptions, IRendererPlugin,
    IRendererPlugins,
    RenderTexture,
    BaseRenderTexture,
} from '@pixi/core';

const tempMatrix = new Matrix();

/**
 * Performs final drawing onto main RenderingContext with contents from secondary RenderingContext.
 */
const DRAW = function(): void
{
    this.context.drawImage(this.$canvas, 0, 0);

    if (this._willDispose)
    {
        this._willDispose = false;
        this.$context = null;
    }
    else
    {
        this.applyTransform(Matrix.IDENTITY, this.$context);
        this._resetContext(this.$context);
    }
};

/**
 * Clears the secondary RenderingContext, (optionally) according to given coordinates.
 *
 * @param {number} [x]
 * @param {number} [y]
 * @param {number} [w]
 * @param {number} [h]
 */
const ERASE = function(x = 0, y = 0, w = Infinity, h = Infinity): void
{
    this.$context.clearRect(x, y, Math.min(w, this.width), Math.min(h, this.height));
};

export interface ICanvasRendererPluginConstructor
{
    new (renderer: CanvasRenderer, options?: any): IRendererPlugin;
}

export interface ICanvasRendererPlugins
{
    [key: string]: any;
}

/*
 * Different browsers support different smoothing property names
 * this is the list of all platform props.
 */
type SmoothingEnabledProperties =
    'imageSmoothingEnabled' |
    'webkitImageSmoothingEnabled' |
    'mozImageSmoothingEnabled' |
    'oImageSmoothingEnabled' |
    'msImageSmoothingEnabled';

/**
 * Rendering context for all browsers. This includes platform-specific
 * properties that are not included in the spec for CanvasRenderingContext2D
 * @private
 */
export interface CrossPlatformCanvasRenderingContext2D extends CanvasRenderingContext2D
{
    webkitImageSmoothingEnabled: boolean;
    mozImageSmoothingEnabled: boolean;
    oImageSmoothingEnabled: boolean;
    msImageSmoothingEnabled: boolean;
}

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas.
 *
 * This renderer should be used for browsers that do not support WebGL.
 * Don't forget to add the CanvasRenderer.view to your DOM or you will not see anything!
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.AbstractRenderer
 */
export class CanvasRenderer extends AbstractRenderer
{
    public readonly rootContext: CrossPlatformCanvasRenderingContext2D;
    public context: CrossPlatformCanvasRenderingContext2D;
    public refresh: boolean;
    public maskManager: CanvasMaskManager;
    public smoothProperty: SmoothingEnabledProperties;
    public readonly blendModes: string[];
    public renderingToScreen: boolean;

    private $context: CanvasRenderingContext2D;
    private _finalize: Function;
    private _erase: Function;

    private _activeBlendMode: BLEND_MODES;
    private _projTransform: Matrix;
    private _willDispose: boolean;

    _outerBlend: boolean;

    /**
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.useContextAlpha=true] - Pass-through value for canvas' context `alpha` property.
     *   If you want to set transparency, please use `backgroundAlpha`. This option is for cases where the
     *   canvas needs to be opaque, possibly for performance reasons on some older devices.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1
     * @param {boolean} [options.antialias=false] - sets antialias
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer. The
     *  resolution of the renderer retina would be 2.
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
        super(RENDERER_TYPE.CANVAS, options);

        /**
         * The root canvas 2d context that everything is drawn with.
         *
         * @member {CanvasRenderingContext2D}
         */
        this.rootContext = this.view.getContext('2d', { alpha: this.useContextAlpha }) as
            CrossPlatformCanvasRenderingContext2D;

        /**
         * The currently active canvas 2d context (could change with renderTextures)
         *
         * @member {CanvasRenderingContext2D}
         */
        this.context = this.rootContext;

        /**
         * Boolean flag controlling canvas refresh.
         *
         * @member {boolean}
         */
        this.refresh = true;

        /**
         * Instance of a CanvasMaskManager, handles masking when using the canvas renderer.
         *
         * @member {PIXI.CanvasMaskManager}
         */
        this.maskManager = new CanvasMaskManager(this);

        /**
         * The canvas property used to set the canvas smoothing property.
         *
         * @member {string}
         */
        this.smoothProperty = 'imageSmoothingEnabled';

        if (!this.rootContext.imageSmoothingEnabled)
        {
            const rc = this.rootContext;

            if (rc.webkitImageSmoothingEnabled)
            {
                this.smoothProperty = 'webkitImageSmoothingEnabled';
            }
            else if (rc.mozImageSmoothingEnabled)
            {
                this.smoothProperty = 'mozImageSmoothingEnabled';
            }
            else if (rc.oImageSmoothingEnabled)
            {
                this.smoothProperty = 'oImageSmoothingEnabled';
            }
            else if (rc.msImageSmoothingEnabled)
            {
                this.smoothProperty = 'msImageSmoothingEnabled';
            }
        }

        this.initPlugins(CanvasRenderer.__plugins);

        /**
         * Tracks the blend modes useful for this renderer.
         *
         * @member {object<number, string>}
         */
        this.blendModes = mapCanvasBlendModesToPixi();
        this._activeBlendMode = null;
        this._outerBlend = false;

        /**
         * Projection transform, passed in render() stored here
         * @type {null}
         * @private
         */
        this._projTransform = null;

        this.renderingToScreen = false;

        sayHello('Canvas');

        /**
         * Fired after rendering finishes.
         *
         * @event PIXI.CanvasRenderer#postrender
         */

        /**
         * Fired before rendering starts.
         *
         * @event PIXI.CanvasRenderer#prerender
         */

        this.resize(this.options.width, this.options.height);
    }

    getPlugin(name: string): IRendererPlugin {
        const plugin = this.plugins[name];

        if (!plugin) return plugin;
        if (!this.$context) return plugin;

        return Object.create(
            plugin,
            {
                renderer:
                {
                    value: this,
                    enumerable: true,
                    writable: false,
                    configurable: true,
                }
            }
        );
    }

    /**
     * Creates an enhanced CanvasRenderer based on this instance.
     * Facilitates further off-screen operations via new secondary RenderingContext.
     *
     * @return {PIXI.CanvasRenderer} The newly enhanced CanvasRenderer
     */
    public forge(): CanvasRenderer {
        if (!this.view || this.$context) return this;

        try
        {
            return Object.create(
                this,
                {
                    $context:
                    {
                        value: this._forgeContext(),
                        enumerable: false,
                        writable: false,
                        configurable: true,
                    }
                }
            ) as CanvasRenderer;
        }
        catch (err)
        {
            console.warn('No OffscreenContext() was created:', err.message || err);
            return this;
        }
    }

    /**
     * Returns (or creates) the secondary RenderingContext, based on the main RenderingContext.
     *
     * @return {[CanvasRenderingContext2D, Function, Function]} The (newly created) secondary RenderingContext; the final drawing function; the erasing function
     */
    forgeContext(): [CanvasRenderingContext2D, Function, Function]
    {
        if (!this.$context) {
            try
            {
                this.$context = this._forgeContext();
                this._willDispose = true;
            }
            catch (err)
            {
                console.warn('No OffscreenContext() was created:', err.message || err);
                return [];
            }
        }

        this._resetContext(this.$context);

        // Create the functions bound to this CanvasRenderer instance, which has the
        //  `$context` (possibly from a previous `forge()` call)
        const draw = DRAW.bind(this);
        const erase = ERASE.bind(this);

        return [this.$context, draw, erase];
    }

    private _forgeContext(): CanvasRenderingContext2D
    {
        return OffscreenContext(this.context) as CanvasRenderingContext2D;
    }

    private _resetContext(context: CanvasRenderingContext2D, blendMode = BLEND_MODES.NORMAL): void
    {
        context.globalCompositeOperation = this.blendModes[blendMode];
    }

    /**
     * Returns the Canvas instance associated with the current $context instance.
     *
     * @return {HTMLCanvasElement}
     */
    private get $canvas(): HTMLCanvasElement {
        return this.$context && this.$context.canvas;
    }

    /**
     * Renders the object to this canvas view
     *
     * @param {PIXI.DisplayObject} displayObject - The object to be rendered
     * @param {PIXI.RenderTexture} [renderTexture] - A render texture to be rendered to.
     *  If unset, it will render to the root context.
     * @param {boolean} [clear=this.clearBeforeRender] - Whether to clear the canvas before drawing
     * @param {PIXI.Matrix} [transform] - A transformation to be applied
     * @param {boolean} [skipUpdateTransform=false] - Whether to skip the update transform
     */
    public render(displayObject: DisplayObject, renderTexture?: RenderTexture | BaseRenderTexture,
        clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean): void
    {
        if (!this.view)
        {
            return;
        }

        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        this.emit('prerender');

        const rootResolution = this.resolution;

        if (renderTexture)
        {
            renderTexture = renderTexture.castToBaseTexture() as BaseRenderTexture;

            if (!renderTexture._canvasRenderTarget)
            {
                renderTexture._canvasRenderTarget = new CanvasRenderTarget(
                    renderTexture.width,
                    renderTexture.height,
                    renderTexture.resolution
                );
                renderTexture.resource = new CanvasResource(renderTexture._canvasRenderTarget.canvas);
                renderTexture.valid = true;
            }

            this.context = renderTexture._canvasRenderTarget.context as CrossPlatformCanvasRenderingContext2D;
            this.resolution = renderTexture._canvasRenderTarget.resolution;
        }
        else
        {
            this.context = this.rootContext;
        }

        const context = this.context;

        this._projTransform = transform || null;

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.enableTempParent();

            displayObject.updateTransform();
            displayObject.disableTempParent(cacheParent);
        }

        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        this._activeBlendMode = BLEND_MODES.NORMAL;
        this._outerBlend = false;
        context.globalCompositeOperation = this.blendModes[BLEND_MODES.NORMAL];

        if (clear !== undefined ? clear : this.clearBeforeRender)
        {
            if (this.renderingToScreen)
            {
                context.clearRect(0, 0, this.width, this.height);

                if (this.backgroundAlpha > 0)
                {
                    context.globalAlpha = this.useContextAlpha ? this.backgroundAlpha : 1;
                    context.fillStyle = this._backgroundColorString;
                    context.fillRect(0, 0, this.width, this.height);
                    context.globalAlpha = 1;
                }
            }
            else
            {
                renderTexture = (renderTexture as BaseRenderTexture);
                renderTexture._canvasRenderTarget.clear();

                const clearColor = renderTexture.clearColor;

                if (clearColor[3] > 0)
                {
                    context.globalAlpha = this.useContextAlpha ? clearColor[3] : 1;
                    context.fillStyle = hex2string(rgb2hex(clearColor));
                    context.fillRect(0, 0, renderTexture.realWidth, renderTexture.realHeight);
                    context.globalAlpha = 1;
                }
            }
        }

        // TODO RENDER TARGET STUFF HERE..
        const tempContext = this.context;

        this.context = context;
        displayObject.renderCanvas(this.forge());
        this.context = tempContext;

        context.restore();

        this.resolution = rootResolution;
        this._projTransform = null;

        this.emit('postrender');
    }

    /**
     * Creates new Matrix for context transform.
     * Resolution is handled appropriately.
     *
     * @param {PIXI.Matrix} transform - world matrix of current element
     * @param {boolean} [roundPixels] - whether to round (tx,ty) coords
     * @param {number} [localResolution] - If specified, used instead of `renderer.resolution` for local scaling
     */
    newContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number): Matrix {
        let mat = transform;
        const proj = this._projTransform;
        const resolution = this.resolution;

        localResolution = localResolution || resolution;

        if (proj)
        {
            mat = tempMatrix;
            mat.copyFrom(transform);
            mat.prepend(proj);
        }

        if (roundPixels)
        {
            return new Matrix(
                mat.a * localResolution,
                mat.b * localResolution,
                mat.c * localResolution,
                mat.d * localResolution,
                (mat.tx * resolution) | 0,
                (mat.ty * resolution) | 0,
            );
        }

        return new Matrix(
            mat.a * localResolution,
            mat.b * localResolution,
            mat.c * localResolution,
            mat.d * localResolution,
            mat.tx * resolution,
            mat.ty * resolution,
        );
    }

    /**
     * Updates current context with given transform Matrix.
     * Resolution is handled appropriately.
     * Only called only from render() methods.
     *
     * @param {PIXI.Matrix} transform - world matrix of current element
     * @param {boolean} [roundPixels] - whether to round (tx,ty) coords
     * @param {number} [localResolution] - If specified, used instead of `renderer.resolution` for local scaling
     */
    setContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number): void
    {
        const mat = this.newContextTransform(transform, roundPixels, localResolution);

        this.applyTransform(mat);
    }

    /**
     * Applies given transform upon the main RenderingContext - or the given context, if specified.
     *
     * @param {PIXI.Matrix} transform - The transformation to apply
     * @param {CanvasRenderingContext2D} [context] - The context to apply transformation to
     */
    applyTransform(transform: Matrix, context?: CanvasRenderingContext2D): void
    {
        if (context == null)
        {
            context = this.context;
        }

        context.setTransform(...transform.raw);
    }

    /**
     * Clears current canvas.
     *
     * @param {string} [clearColor] - Clear the canvas with this color, except the canvas is transparent.
     * @param {number} [alpha] - Alpha to apply to the background fill color.
     */
    public clear(clearColor: string = this._backgroundColorString, alpha: number = this.backgroundAlpha): void
    {
        const { context } = this;

        context.clearRect(0, 0, this.width, this.height);

        if (clearColor)
        {
            context.globalAlpha = this.useContextAlpha ? alpha : 1;
            context.fillStyle = clearColor;
            context.fillRect(0, 0, this.width, this.height);
            context.globalAlpha = 1;
        }
    }

    /**
     * Sets the blend mode of the renderer.
     *
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     * @param {boolean} [readyForOuterBlend=false] - Some blendModes are dangerous, they affect outer space of sprite.
     * Pass `true` only if you are ready to use them.
     */
    setBlendMode(blendMode: BLEND_MODES, readyForOuterBlend?: boolean): void
    {
        const outerBlend = blendMode === BLEND_MODES.SRC_IN
            || blendMode === BLEND_MODES.SRC_OUT
            || blendMode === BLEND_MODES.DST_IN
            || blendMode === BLEND_MODES.DST_ATOP;

        if (!readyForOuterBlend && outerBlend)
        {
            blendMode = BLEND_MODES.NORMAL;
        }

        if (this._activeBlendMode === blendMode)
        {
            return;
        }

        this._activeBlendMode = blendMode;
        this._outerBlend = outerBlend;
        this.context.globalCompositeOperation = this.blendModes[blendMode];
    }

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    public destroy(removeView?: boolean): void
    {
        // call the base destroy
        super.destroy(removeView);

        this.context = null;

        this.refresh = true;

        this.maskManager.destroy();
        this.maskManager = null;

        this.smoothProperty = null;
    }

    /**
     * Resizes the canvas view to the specified width and height.
     *
     * @extends PIXI.AbstractRenderer#resize
     *
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    public resize(screenWidth: number, screenHeight: number): void
    {
        super.resize(screenWidth, screenHeight);

        // reset the scale mode.. oddly this seems to be reset when the canvas is resized.
        // surely a browser bug?? Let PixiJS fix that for you..
        if (this.smoothProperty)
        {
            this.rootContext[this.smoothProperty] = (settings.SCALE_MODE === SCALE_MODES.LINEAR);
        }
    }

    /**
     * Checks if blend mode has changed.
     */
    invalidateBlendMode(): void
    {
        this._activeBlendMode = this.blendModes.indexOf(this.context.globalCompositeOperation);
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
     * @param {string} pluginName - The name of the plugin.
     * @param {Function} ctor - The constructor function or class for the plugin.
     */
    static registerPlugin(pluginName: string, ctor: ICanvasRendererPluginConstructor): void
    {
        CanvasRenderer.__plugins = CanvasRenderer.__plugins || {};
        CanvasRenderer.__plugins[pluginName] = ctor;
    }
}
