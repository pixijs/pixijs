import { hex2string, hex2rgb, deprecation, EventEmitter } from '@pixi/utils';
import { Matrix, Rectangle } from '@pixi/math';
import { RENDERER_TYPE } from '@pixi/constants';
import { settings } from '@pixi/settings';
import { DisplayObject, TemporaryDisplayObject } from '@pixi/display';
import { RenderTexture } from './renderTexture/RenderTexture';

import type { SCALE_MODES } from '@pixi/constants';
import type { IRenderingContext } from './IRenderingContext';
import type { Container } from '@pixi/display';

const tempMatrix = new Matrix();

export interface IRendererOptions extends GlobalMixins.IRendererOptions
{
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    transparent?: boolean | 'notMultiplied';
    autoDensity?: boolean;
    antialias?: boolean;
    resolution?: number;
    preserveDrawingBuffer?: boolean;
    clearBeforeRender?: boolean;
    backgroundColor?: number;
    powerPreference?: WebGLPowerPreference;
    context?: IRenderingContext;
}

interface IRendererOptionsLegacy extends IRendererOptions
{
    autoResize?: boolean;
    roundPixels?: boolean;
}

export interface IRendererPlugins
{
    [key: string]: any;
}

/**
 * The AbstractRenderer is the base for a PixiJS Renderer. It is extended by the {@link PIXI.CanvasRenderer}
 * and {@link PIXI.Renderer} which can be used for rendering a PixiJS scene.
 *
 * @abstract
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
export abstract class AbstractRenderer extends EventEmitter
{
    public resolution: number;
    public clearBeforeRender?: boolean;
    public readonly options: IRendererOptions;
    public readonly type: RENDERER_TYPE;
    public readonly screen: Rectangle;
    public readonly view: HTMLCanvasElement;
    public readonly plugins: IRendererPlugins;
    public readonly transparent: boolean | 'notMultiplied';
    public readonly autoDensity: boolean;
    public readonly preserveDrawingBuffer: boolean;

    protected readonly _tempDisplayObjectParent: DisplayObject;
    protected _backgroundColor: number;
    protected _backgroundColorString: string;
    _backgroundColorRgba: number[];
    _lastObjectRendered: DisplayObject;

    /**
     * @param {string} system - The name of the system this renderer is for.
     * @param {object} [options] - The optional renderer parameters.
     * @param {number} [options.width=800] - The width of the screen.
     * @param {number} [options.height=600] - The height of the screen.
     * @param {HTMLCanvasElement} [options.view] - The canvas to use as a view, optional.
     * @param {boolean} [options.transparent=false] - If the render view is transparent.
     * @param {boolean} [options.autoDensity=false] - Resizes renderer view in CSS pixels to allow for
     *   resolutions other than 1.
     * @param {boolean} [options.antialias=false] - Sets antialias
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer. The
     *  resolution of the renderer retina would be 2.
     * @param {boolean} [options.preserveDrawingBuffer=false] - Enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the WebGL context.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear the canvas or
     *      not before the new render pass.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     */
    constructor(type: RENDERER_TYPE = RENDERER_TYPE.UNKNOWN, options?: IRendererOptions)
    {
        super();

        // Add the default render options
        options = Object.assign({}, settings.RENDER_OPTIONS, options);

        // Deprecation notice for renderer roundPixels option
        if ((options as IRendererOptionsLegacy).roundPixels)
        {
            settings.ROUND_PIXELS = (options as IRendererOptionsLegacy).roundPixels;
            deprecation('5.0.0', 'Renderer roundPixels option is deprecated, please use PIXI.settings.ROUND_PIXELS', 2);
        }

        /**
         * The supplied constructor options.
         *
         * @member {Object}
         * @readOnly
         */
        this.options = options;

        /**
         * The type of the renderer.
         *
         * @member {number}
         * @default PIXI.RENDERER_TYPE.UNKNOWN
         * @see PIXI.RENDERER_TYPE
         */
        this.type = type;

        /**
         * Measurements of the screen. (0, 0, screenWidth, screenHeight).
         *
         * Its safe to use as filterArea or hitArea for the whole stage.
         *
         * @member {PIXI.Rectangle}
         */
        this.screen = new Rectangle(0, 0, options.width, options.height);

        /**
         * The canvas element that everything is drawn to.
         *
         * @member {HTMLCanvasElement}
         */
        this.view = options.view || document.createElement('canvas');

        /**
         * The resolution / device pixel ratio of the renderer.
         *
         * @member {number}
         * @default 1
         */
        this.resolution = options.resolution || settings.RESOLUTION;

        /**
         * Whether the render view is transparent.
         *
         * @member {boolean}
         */
        this.transparent = options.transparent;

        /**
         * Whether CSS dimensions of canvas view should be resized to screen dimensions automatically.
         *
         * @member {boolean}
         */
        this.autoDensity = options.autoDensity || (options as IRendererOptionsLegacy).autoResize || false;
        // autoResize is deprecated, provides fallback support

        /**
         * The value of the preserveDrawingBuffer flag affects whether or not the contents of
         * the stencil buffer is retained after rendering.
         *
         * @member {boolean}
         */
        this.preserveDrawingBuffer = options.preserveDrawingBuffer;

        /**
         * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
         * If the scene is NOT transparent PixiJS will use a canvas sized fillRect operation every
         * frame to set the canvas background color. If the scene is transparent PixiJS will use clearRect
         * to clear the canvas every frame. Disable this by setting this to false. For example, if
         * your game has a canvas filling background image you often don't need this set.
         *
         * @member {boolean}
         * @default
         */
        this.clearBeforeRender = options.clearBeforeRender;

        /**
         * The background color as a number.
         *
         * @member {number}
         * @protected
         */
        this._backgroundColor = 0x000000;

        /**
         * The background color as an [R, G, B] array.
         *
         * @member {number[]}
         * @protected
         */
        this._backgroundColorRgba = [0, 0, 0, 0];

        /**
         * The background color as a string.
         *
         * @member {string}
         * @protected
         */
        this._backgroundColorString = '#000000';

        this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

        /**
         * This temporary display object used as the parent of the currently being rendered item.
         *
         * @member {PIXI.DisplayObject}
         * @protected
         */
        this._tempDisplayObjectParent = new TemporaryDisplayObject();

        /**
         * The last root object that the renderer tried to render.
         *
         * @member {PIXI.DisplayObject}
         * @protected
         */
        this._lastObjectRendered = this._tempDisplayObjectParent;

        /**
         * Collection of plugins.
         * @readonly
         * @member {object}
         */
        this.plugins = {};
    }

    /**
     * Initialize the plugins.
     *
     * @protected
     * @param {object} staticMap - The dictionary of statically saved plugins.
     */
    initPlugins(staticMap: IRendererPlugins): void
    {
        for (const o in staticMap)
        {
            this.plugins[o] = new (staticMap[o])(this);
        }
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
        return this.view.width;
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
        return this.view.height;
    }

    /**
     * Resizes the screen and canvas to the specified width and height.
     * Canvas dimensions are multiplied by resolution.
     *
     * @param {number} screenWidth - The new width of the screen.
     * @param {number} screenHeight - The new height of the screen.
     */
    resize(screenWidth: number, screenHeight: number): void
    {
        this.screen.width = screenWidth;
        this.screen.height = screenHeight;

        this.view.width = screenWidth * this.resolution;
        this.view.height = screenHeight * this.resolution;

        if (this.autoDensity)
        {
            this.view.style.width = `${screenWidth}px`;
            this.view.style.height = `${screenHeight}px`;
        }

        /**
         * Fired after view has been resized.
         *
         * @event PIXI.Renderer#resize
         * @param {number} screenWidth - The new width of the screen.
         * @param {number} screenHeight - The new height of the screen.
         */
        this.emit('resize', screenWidth, screenHeight);
    }

    /**
     * Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     *
     * @param {PIXI.DisplayObject} displayObject - The displayObject the object will be generated from.
     * @param {PIXI.SCALE_MODES} scaleMode - The scale mode of the texture.
     * @param {number} resolution - The resolution / device pixel ratio of the texture being generated.
     * @param {PIXI.Rectangle} [region] - The region of the displayObject, that shall be rendered,
     *        if no region is specified, defaults to the local bounds of the displayObject.
     * @return {PIXI.RenderTexture} A texture of the graphics object.
     */
    generateTexture(displayObject: DisplayObject,
        scaleMode?: SCALE_MODES, resolution?: number, region?: Rectangle): RenderTexture
    {
        region = region || (displayObject as Container).getLocalBounds(null, true);

        // minimum texture size is 1x1, 0x0 will throw an error
        if (region.width === 0) region.width = 1;
        if (region.height === 0) region.height = 1;

        const renderTexture = RenderTexture.create(
            {
                width: region.width | 0,
                height: region.height | 0,
                scaleMode,
                resolution,
            });

        tempMatrix.tx = -region.x;
        tempMatrix.ty = -region.y;

        this.render(displayObject, renderTexture, false, tempMatrix, !!displayObject.parent);

        return renderTexture;
    }

    abstract render(displayObject: DisplayObject, renderTexture?: RenderTexture,
                    clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean): void;

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView?: boolean): void
    {
        for (const o in this.plugins)
        {
            this.plugins[o].destroy();
            this.plugins[o] = null;
        }

        if (removeView && this.view.parentNode)
        {
            this.view.parentNode.removeChild(this.view);
        }

        const thisAny = this as any;

        // null-ing all objects, that's a tradition!

        thisAny.plugins = null;
        thisAny.type = RENDERER_TYPE.UNKNOWN;
        thisAny.view = null;
        thisAny.screen = null;
        thisAny._tempDisplayObjectParent = null;
        thisAny.options = null;
        this._backgroundColorRgba = null;
        this._backgroundColorString = null;
        this._lastObjectRendered = null;
    }

    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     */
    get backgroundColor(): number
    {
        return this._backgroundColor;
    }

    set backgroundColor(value) // eslint-disable-line require-jsdoc
    {
        this._backgroundColor = value;
        this._backgroundColorString = hex2string(value);
        hex2rgb(value, this._backgroundColorRgba);
    }
}
