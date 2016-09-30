import { sayHello, hex2string, hex2rgb } from '../utils';
import { Matrix } from '../math';
import { DEFAULT_RENDER_OPTIONS, RENDERER_TYPE } from '../const';
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
    /**
     * @param {string} system - The name of the system this renderer is for.
     * @param {number} [width=800] - the width of the canvas view
     * @param {number} [height=600] - the height of the canvas view
     * @param {object} [options] - The optional renderer parameters
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
    constructor(system, width, height, options)
    {
        super();

        sayHello(system);

        // prepare options
        if (options)
        {
            for (const i in DEFAULT_RENDER_OPTIONS)
            {
                if (typeof options[i] === 'undefined')
                {
                    options[i] = DEFAULT_RENDER_OPTIONS[i];
                }
            }
        }
        else
        {
            options = DEFAULT_RENDER_OPTIONS;
        }

        /**
         * The type of the renderer.
         *
         * @member {number}
         * @default PIXI.RENDERER_TYPE.UNKNOWN
         * @see PIXI.RENDERER_TYPE
         */
        this.type = RENDERER_TYPE.UNKNOWN;

        /**
         * The width of the canvas view
         *
         * @member {number}
         * @default 800
         */
        this.width = width || 800;

        /**
         * The height of the canvas view
         *
         * @member {number}
         * @default 600
         */
        this.height = height || 600;

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
        this.resolution = options.resolution;

        /**
         * Whether the render view is transparent
         *
         * @member {boolean}
         */
        this.transparent = options.transparent;

        /**
         * Whether the render view should be resized automatically
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
     * Resizes the canvas view to the specified width and height
     *
     * @param {number} width - the new width of the canvas view
     * @param {number} height - the new height of the canvas view
     */
    resize(width, height)
    {
        this.width = width * this.resolution;
        this.height = height * this.resolution;

        this.view.width = this.width;
        this.view.height = this.height;

        if (this.autoResize)
        {
            this.view.style.width = `${this.width / this.resolution}px`;
            this.view.style.height = `${this.height / this.resolution}px`;
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

        this.width = 0;
        this.height = 0;

        this.view = null;

        this.resolution = 0;

        this.transparent = false;

        this.autoResize = false;

        this.blendModes = null;

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
     * @memberof PIXI.SystemRenderer#
     */
    get backgroundColor()
    {
        return this._backgroundColor;
    }

    /**
     * Sets the background color.
     *
     * @param {number} value - The value to set to.
     */
    set backgroundColor(value)
    {
        this._backgroundColor = value;
        this._backgroundColorString = hex2string(value);
        hex2rgb(value, this._backgroundColorRgba);
    }
}
