import SystemRenderer from '../SystemRenderer';
import MaskSystem from './systems/MaskSystem';
import StencilSystem from './systems/StencilSystem';
import FilterSystem from './systems/FilterSystem';
import FramebufferSystem from './systems/FramebufferSystem';
import RenderTextureSystem from './systems/RenderTextureSystem';
import NewTextureSystem from './systems/NewTextureSystem';
import TextureSystem from './TextureManager';
import ProjectionSystem from './systems/ProjectionSystem';
import StateSystem from './systems/StateSystem';
import GeometrySystem from './systems/GeometrySystem';
import ShaderSystem from './systems/ShaderSystem';
import ContextSystem from './systems/ContextSystem';
import BatchSystem from './systems/BatchSystem';
import TextureGCSystem from './systems/TextureGCSystem';
import { pluginTarget } from '../../utils';
import glCore from 'pixi-gl-core';
import { RENDERER_TYPE } from '../../const';
import UniformGroup from '../../shader/UniformGroup';
import { Rectangle, Matrix } from '../../math';
import Runner from 'mini-runner';

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 */
export default class WebGLRenderer extends SystemRenderer
{
    /**
     *
     * @param {number} [screenWidth=800] - the width of the screen
     * @param {number} [screenHeight=600] - the height of the screen
     * @param {object} [options] - The optional renderer parameters
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoResize=false] - If the render view is automatically resized, default false
     * @param {boolean} [options.antialias=false] - sets antialias. If not available natively then FXAA
     *  antialiasing is used
     * @param {boolean} [options.forceFXAA=false] - forces FXAA antialiasing to be used over native.
     *  FXAA is faster, but may not always look as great
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer.
     *  The resolution of the renderer retina would be 2.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the CanvasRenderer will clear
     *  the canvas or not before the new render pass. If you wish to set this to false, you *must* set
     *  preserveDrawingBuffer to `true`.
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the webgl context.
     * @param {boolean} [options.roundPixels=false] - If true Pixi will Math.floor() x/y values when
     *  rendering, stopping pixel interpolation.
     * @param {boolean} [options.legacy=false] - If true Pixi will aim to ensure compatibility
     * with older / less advanced devices. If you experiance unexplained flickering try setting this to true.
     */
    constructor(screenWidth, screenHeight, options = {})
    {
        super('WebGL', screenWidth, screenHeight, options);

        /**
         * The type of this renderer as a standardised const
         *
         * @member {number}
         * @see PIXI.RENDERER_TYPE
         */
        this.type = RENDERER_TYPE.WEBGL;

         // this will be set by the contextSystem (this.context)
        this.gl = null;
        this.CONTEXT_UID = 0;
        this.legacy = !!options.legacy;

        if (this.legacy)
        {
            glCore.VertexArrayObject.FORCE_NATIVE = true;
        }

        // runners!
        this.runners = {
            destroy:        new Runner('destroy'),
            contextChange:  new Runner('contextChange', 1),
            reset:          new Runner('reset'),
            update:         new Runner('update'),
            postrender:     new Runner('postrender'),
            prerender:      new Runner('prerender'),
            resize:         new Runner('resize', 2),
        };


        /**
         * The options passed in to create a new webgl context.
         *
         * @member {object}
         * @private
         */
        this._backgroundColorRgba[3] = this.transparent ? 0 : 1;

        this.globalUniforms = new UniformGroup({
            projectionMatrix:new Matrix()
        }, true)

        this.addSystem(MaskSystem)
        .addSystem(ContextSystem)
        .addSystem(StateSystem)
        .addSystem(ShaderSystem)
        .addSystem(NewTextureSystem, 'texture')
        .addSystem(GeometrySystem)
        .addSystem(FramebufferSystem)
        .addSystem(StencilSystem)
        .addSystem(ProjectionSystem)
        .addSystem(TextureGCSystem)
        .addSystem(FilterSystem)
        .addSystem(RenderTextureSystem)
        .addSystem(BatchSystem)

        this.initPlugins();

        if(options.context)
        {
            this.context.initFromContext(options.context);
        }
        else
        {
            this.context.initFromOptions({
                alpha: this.transparent,
                antialias: options.antialias,
                premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
                stencil: true,
                preserveDrawingBuffer: options.preserveDrawingBuffer,
            });
        }

        this.renderingToScreen = true;

        this._nextTextureLocation = 0;

        this._initContext();
    }

    addSystem(_class, name)
    {
        if(!name)
        {
            name = _class.name;
        }

        //TODO - read name from class.name..
        if(name.includes('System'))
        {
            name = name.replace('System', '');
            name = name.charAt(0).toLowerCase() + name.slice(1);
        }

        const system = new _class(this);

        if(this[name])
        {
            throw new Error('Whoops! ' + name + ' is already a manger');
            return;
        }

        this[name] = system;

        for(var i in this.runners)
        {
            this.runners[i].add(system);
        }

        return this;
    }

    /**
     * Creates the WebGL context
     *
     * @private
     */
    _initContext()
    {
        const gl = this.gl;

        const maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        this.boundTextures = new Array(maxTextures);
        this.emptyTextures = new Array(maxTextures);

        const tempObj = { _glTextures: {} };

        for (let i = 0; i < maxTextures; i++)
        {
            this.boundTextures[i] = tempObj;
        }

        // setup the width/height properties and gl viewport
        this.resize(this.screen.width, this.screen.height);
    }

    /**
     * Renders the object to its webGL view
     *
     * @param {PIXI.DisplayObject} displayObject - the object to be rendered
     * @param {PIXI.RenderTexture} renderTexture - The render texture to render to.
     * @param {boolean} [clear] - Should the canvas be cleared before the new render
     * @param {PIXI.Transform} [transform] - A transform to apply to the render texture before rendering.
     * @param {boolean} [skipUpdateTransform] - Should we skip the update transform pass?
     */
    render(displayObject, renderTexture, clear, transform, skipUpdateTransform)
    {
        // can be handy to know!
        this.renderingToScreen = !renderTexture;

        this.runners.prerender.run();
        this.emit('prerender');

        // no point rendering if our context has been blown up!
        if(this.context.isLost)
        {
            return;
        }
        this._nextTextureLocation = 0;

        if (!renderTexture)
        {
            this._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            // update the scene graph
            const cacheParent = displayObject.parent;

            displayObject.parent = this._tempDisplayObjectParent;
            displayObject.updateTransform();
            displayObject.parent = cacheParent;
           // displayObject.hitArea = //TODO add a temp hit area
        }

        this.renderTexture.bind(renderTexture);
        this.batch.currentRenderer.start();

        if (clear !== undefined ? clear : this.clearBeforeRender)
        {
            this.renderTexture.clear();
        }

        displayObject.renderWebGL(this);

        // apply transform..
        this.batch.currentRenderer.flush();

        this.runners.postrender.run();
        this.emit('postrender');
    }

    /**
     * Resizes the webGL view to the specified width and height.
     *
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    resize(screenWidth, screenHeight)
    {
        SystemRenderer.prototype.resize.call(this, screenWidth, screenHeight);
        this.runners.resize.run(screenWidth, screenHeight);
    }

    /**
     * Resets the WebGL state so you can render things however you fancy!
     *
     * @return {PIXI.WebGLRenderer} Returns itself.
     */
    reset()
    {
        this.runners.reset.run();
        return this;
    }

    /**
     * Removes everything from the renderer (event listeners, spritebatch, etc...)
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     *  See: https://github.com/pixijs/pixi.js/issues/2233
     */
    destroy(removeView)
    {
        // call base destroy
        super.destroy(removeView);

        this.destroyPlugins();
        this.runners.destroy.run();

        // TODO nullify all the managers..
        this.gl = null;
    }
}

pluginTarget.mixin(WebGLRenderer);
