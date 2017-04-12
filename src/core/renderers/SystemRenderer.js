import { sayHello, hex2string, hex2rgb } from '../utils';
import { Matrix, Rectangle } from '../math';
import { RENDERER_TYPE } from '../const';
import settings from '../settings';
import Container from '../display/Container';
import RenderTexture from '../textures/RenderTexture';
import EventEmitter from 'eventemitter3';

const tempMatrix = new Matrix();

/**
 * The SystemRenderer is the base for a Pixi Renderer. It is extended by the {@link PIXI.CanvasRenderer}
 * and {@link PIXI.WebGLRenderer} which can be used for rendering a Pixi scene.
 *
 * @abstract
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
export default class SystemRenderer extends EventEmitter
{
    // eslint-disable-next-line valid-jsdoc
    /**
     * @param {string} system - The name of the system this renderer is for.
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoResize=false] - If the render view is automatically resized, default false
     * @param {boolean} [options.antialias=false] - sets antialias (only applicable in chrome at the moment)
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer. The
     *  resolution of the renderer retina would be 2.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the CanvasRenderer will clear the canvas or
     *      not before the new render pass.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     * @param {boolean} [options.roundPixels=false] - If true Pixi will Math.floor() x/y values when rendering,
     *  stopping pixel interpolation.
     */
    constructor(system, options, arg2, arg3)
    {
        super();

        sayHello(system);

        // Support for constructor(system, screenWidth, screenHeight, options)
        if (typeof options === 'number')
        {
            options = Object.assign({
                width: options,
                height: arg2 || settings.RENDER_OPTIONS.height,
            }, arg3);
        }

        // Add the default render options
        options = Object.assign({}, settings.RENDER_OPTIONS, options);

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
        this.type = RENDERER_TYPE.UNKNOWN;

        /**
         * Measurements of the screen. (0, 0, screenWidth, screenHeight)
         *
         * Its safe to use as filterArea or hitArea for whole stage
         *
         * @member {PIXI.Rectangle}
         */
        this.screen = new Rectangle(0, 0, options.width, options.height);

        /**
         * The canvas element that everything is drawn to
         *
         * @member {HTMLCanvasElement}
         */
        this.view = options.view || document.createElement('canvas');

        /**
         * The resolution / device pixel ratio of the renderer
         *
         * @member {number}
         * @default 1
         */
        this.resolution = options.resolution || settings.RESOLUTION;

        /**
         * Whether the render view is transparent
         *
         * @member {boolean}
         */
        this.transparent = options.transparent;

        /**
         * Whether css dimensions of canvas view should be resized to screen dimensions automatically
         *
         * @member {boolean}
         */
        this.autoResize = options.autoResize || false;

        /**
         * Tracks the blend modes useful for this renderer.
         *
         * @member {object<string, mixed>}
         */
        this.blendModes = null;

        /**
         * The value of the preserveDrawingBuffer flag affects whether or not the contents of
         * the stencil buffer is retained after rendering.
         *
         * @member {boolean}
         */
        this.preserveDrawingBuffer = options.preserveDrawingBuffer;

        /**
         * This sets if the CanvasRenderer will clear the canvas or not before the new render pass.
         * If the scene is NOT transparent Pixi will use a canvas sized fillRect operation every
         * frame to set the canvas background color. If the scene is transparent Pixi will use clearRect
         * to clear the canvas every frame. Disable this by setting this to false. For example if
         * your game has a canvas filling background image you often don't need this set.
         *
         * @member {boolean}
         * @default
         */
        this.clearBeforeRender = options.clearBeforeRender;

        /**
         * If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
         * Handy for crisp pixel art and speed on legacy devices.
         *
         * @member {boolean}
         */
        this.roundPixels = options.roundPixels;

        /**
         * The background color as a number.
         *
         * @member {number}
         * @private
         */
        this._backgroundColor = 0x000000;

        /**
         * The background color as an [R, G, B] array.
         *
         * @member {number[]}
         * @private
         */
        this._backgroundColorRgba = [0, 0, 0, 0];

        /**
         * The background color as a string.
         *
         * @member {string}
         * @private
         */
        this._backgroundColorString = '#000000';

        this.backgroundColor = options.backgroundColor || this._backgroundColor; // run bg color setter

        /**
         * This temporary display object used as the parent of the currently being rendered item
         *
         * @member {PIXI.DisplayObject}
         * @private
         */
        this._tempDisplayObjectParent = new Container();

        /**
         * The last root object that the renderer tried to render.
         *
         * @member {PIXI.DisplayObject}
         * @private
         */
        this._lastObjectRendered = this._tempDisplayObjectParent;
    }

    /**
     * Same as view.width, actual number of pixels in the canvas by horizontal
     *
     * @member {number}
     * @readonly
     * @default 800
     */
    get width()
    {
        return this.view.width;
    }

    /**
     * Same as view.height, actual number of pixels in the canvas by vertical
     *
     * @member {number}
     * @readonly
     * @default 600
     */
    get height()
    {
        return this.view.height;
    }

    /**
     * Resizes the screen and canvas to the specified width and height
     * Canvas dimensions are multiplied by resolution
     *
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    resize(screenWidth, screenHeight)
    {
        this.screen.width = screenWidth;
        this.screen.height = screenHeight;

        this.view.width = screenWidth * this.resolution;
        this.view.height = screenHeight * this.resolution;

        if (this.autoResize)
        {
            this.view.style.width = `${screenWidth}px`;
            this.view.style.height = `${screenHeight}px`;
        }
    }

    /**
     * Useful function that returns a texture of the display object that can then be used to create sprites
     * This can be quite useful if your displayObject is complicated and needs to be reused multiple times.
     *
     * @param {PIXI.DisplayObject} displayObject - The displayObject the object will be generated from
     * @param {number} scaleMode - Should be one of the scaleMode consts
     * @param {number} resolution - The resolution / device pixel ratio of the texture being generated
     * @return {PIXI.Texture} a texture of the graphics object
     */
    generateTexture(displayObject, scaleMode, resolution)
    {
        const bounds = displayObject.getLocalBounds();

        const renderTexture = RenderTexture.create(bounds.width | 0, bounds.height | 0, scaleMode, resolution);

        tempMatrix.tx = -bounds.x;
        tempMatrix.ty = -bounds.y;

        this.render(displayObject, renderTexture, false, tempMatrix, true);

        return renderTexture;
    }

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView)
    {
        if (removeView && this.view.parentNode)
        {
            this.view.parentNode.removeChild(this.view);
        }

        this.type = RENDERER_TYPE.UNKNOWN;

        this.view = null;

        this.screen = null;

        this.resolution = 0;

        this.transparent = false;

        this.autoResize = false;

        this.blendModes = null;

        this.options = null;

        this.preserveDrawingBuffer = false;
        this.clearBeforeRender = false;

        this.roundPixels = false;

        this._backgroundColor = 0;
        this._backgroundColorRgba = null;
        this._backgroundColorString = null;

        this.backgroundColor = 0;
        this._tempDisplayObjectParent = null;
        this._lastObjectRendered = null;
    }

    /**
     * The background color to fill if not transparent
     *
     * @member {number}
     */
    get backgroundColor()
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
