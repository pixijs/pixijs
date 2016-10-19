import SystemRenderer from '../SystemRenderer';
import CanvasMaskManager from './utils/CanvasMaskManager';
import CanvasRenderTarget from './utils/CanvasRenderTarget';
import mapCanvasBlendModesToPixi from './utils/mapCanvasBlendModesToPixi';
import { pluginTarget } from '../../utils';
import { RENDERER_TYPE, SCALE_MODES, BLEND_MODES } from '../../const';

/**
 * The CanvasRenderer draws the scene and all its content onto a 2d canvas. This renderer should
 * be used for browsers that do not support WebGL. Don't forget to add the CanvasRenderer.view to
 * your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 */
export default class CanvasRenderer extends SystemRenderer
{
    /**
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
    constructor(width, height, options = {})
    {
        super('Canvas', width, height, options);

        this.type = RENDERER_TYPE.CANVAS;

        /**
         * The canvas 2d context that everything is drawn with.
         *
         * @member {CanvasRenderingContext2D}
         */
        this.rootContext = this.view.getContext('2d', { alpha: this.transparent });

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
            if (this.rootContext.webkitImageSmoothingEnabled)
            {
                this.smoothProperty = 'webkitImageSmoothingEnabled';
            }
            else if (this.rootContext.mozImageSmoothingEnabled)
            {
                this.smoothProperty = 'mozImageSmoothingEnabled';
            }
            else if (this.rootContext.oImageSmoothingEnabled)
            {
                this.smoothProperty = 'oImageSmoothingEnabled';
            }
            else if (this.rootContext.msImageSmoothingEnabled)
            {
                this.smoothProperty = 'msImageSmoothingEnabled';
            }
        }

        this.initPlugins();

        this.blendModes = mapCanvasBlendModesToPixi();
        this._activeBlendMode = null;

        this.context = null;
        this.renderingToScreen = false;

        this.resize(width, height);
    }

    /**
     * Renders the object to this canvas view
     *
     * @param {PIXI.DisplayObject} displayObject - The object to be rendered
     * @param {PIXI.RenderTexture} [renderTexture] - A render texture to be rendered to.
     *  If unset, it will render to the root context.
     * @param {boolean} [clear=false] - Whether to clear the canvas before drawing
     * @param {PIXI.Transform} [transform] - A transformation to be applied
     * @param {boolean} [skipUpdateTransform=false] - Whether to skip the update transform
     */
    render(displayObject, renderTexture, clear, transform, skipUpdateTransform)
    {
        if (!this.view)
        {
            return;
        }

        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        this.emit('prerender');

        if (renderTexture)
        {
            renderTexture = renderTexture.baseTexture || renderTexture;

            if (!renderTexture._canvasRenderTarget)
            {
                renderTexture._canvasRenderTarget = new CanvasRenderTarget(
                    renderTexture.width,
                    renderTexture.height,
                    renderTexture.resolution
                );
                renderTexture.source = renderTexture._canvasRenderTarget.canvas;
                renderTexture.valid = true;
            }

            this.context = renderTexture._canvasRenderTarget.context;
            this.resolution = renderTexture._canvasRenderTarget.resolution;
        }
        else
        {
            this.context = this.rootContext;
        }

        const context = this.context;

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.parent;
            const tempWt = this._tempDisplayObjectParent.transform.worldTransform;

            if (transform)
            {
                transform.copy(tempWt);
            }
            else
            {
                tempWt.identity();
            }

            displayObject.parent = this._tempDisplayObjectParent;
            displayObject.updateTransform();
            displayObject.parent = cacheParent;
            // displayObject.hitArea = //TODO add a temp hit area
        }

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        context.globalCompositeOperation = this.blendModes[BLEND_MODES.NORMAL];

        if (navigator.isCocoonJS && this.view.screencanvas)
        {
            context.fillStyle = 'black';
            context.clear();
        }

        if (clear !== undefined ? clear : this.clearBeforeRender)
        {
            if (this.renderingToScreen)
            {
                if (this.transparent)
                {
                    context.clearRect(0, 0, this.width, this.height);
                }
                else
                {
                    context.fillStyle = this._backgroundColorString;
                    context.fillRect(0, 0, this.width, this.height);
                }
            } // else {
            // TODO: implement background for CanvasRenderTarget or RenderTexture?
            // }
        }

        // TODO RENDER TARGET STUFF HERE..
        const tempContext = this.context;

        this.context = context;
        displayObject.renderCanvas(this);
        this.context = tempContext;

        this.emit('postrender');
    }

    /**
     * Sets the blend mode of the renderer.
     *
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     */
    setBlendMode(blendMode)
    {
        if (this._activeBlendMode === blendMode)
        {
            return;
        }

        this.context.globalCompositeOperation = this.blendModes[blendMode];
    }

    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView)
    {
        this.destroyPlugins();

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
     * @extends PIXI.SystemRenderer#resize
     *
     * @param {number} width - The new width of the canvas view
     * @param {number} height - The new height of the canvas view
     */
    resize(width, height)
    {
        super.resize(width, height);

        // reset the scale mode.. oddly this seems to be reset when the canvas is resized.
        // surely a browser bug?? Let pixi fix that for you..
        if (this.smoothProperty)
        {
            this.rootContext[this.smoothProperty] = (SCALE_MODES.DEFAULT === SCALE_MODES.LINEAR);
        }
    }
}

pluginTarget.mixin(CanvasRenderer);
