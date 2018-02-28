import AbstractRenderer from './AbstractRenderer';
import { sayHello } from '@pixi/utils';
import MaskSystem from './mask/MaskSystem';
import StencilSystem from './mask/StencilSystem';
import FilterSystem from './filters/FilterSystem';
import FramebufferSystem from './framebuffer/FramebufferSystem';
import RenderTextureSystem from './renderTexture/RenderTextureSystem';
import TextureSystem from './textures/TextureSystem';
import ProjectionSystem from './projection/ProjectionSystem';
import StateSystem from './state/StateSystem';
import GeometrySystem from './geometry/GeometrySystem';
import ShaderSystem from './shader/ShaderSystem';
import ContextSystem from './context/ContextSystem';
import BatchSystem from './batch/BatchSystem';
import TextureGCSystem from './textures/TextureGCSystem';
import { RENDERER_TYPE } from '@pixi/constants';
import UniformGroup from './shader/UniformGroup';
import { Matrix } from '@pixi/math';
import Runner from 'mini-runner';

/**
 * The Renderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.AbstractRenderer
 */
export default class Renderer extends AbstractRenderer
{
    // eslint-disable-next-line valid-jsdoc
    /**
     *
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
     * @param {boolean} [options.autoResize=false] - If the render view is automatically resized, default false
     * @param {boolean} [options.antialias=false] - sets antialias. If not available natively then FXAA
     *  antialiasing is used
     * @param {boolean} [options.forceFXAA=false] - forces FXAA antialiasing to be used over native.
     *  FXAA is faster, but may not always look as great
     * @param {number} [options.resolution=1] - The resolution / device pixel ratio of the renderer.
     *  The resolution of the renderer retina would be 2.
     * @param {boolean} [options.clearBeforeRender=true] - This sets if the renderer will clear
     *  the canvas or not before the new render pass. If you wish to set this to false, you *must* set
     *  preserveDrawingBuffer to `true`.
     * @param {boolean} [options.preserveDrawingBuffer=false] - enables drawing buffer preservation,
     *  enable this if you need to call toDataUrl on the webgl context.
     * @param {boolean} [options.roundPixels=false] - If true PixiJS will Math.floor() x/y values when
     *  rendering, stopping pixel interpolation.
     * @param {number} [options.backgroundColor=0x000000] - The background color of the rendered area
     *  (shown if not transparent).
     * @param {string} [options.powerPreference] - Parameter passed to webgl context, set to "high-performance"
     *  for devices with dual graphics card
     */
    constructor(options, arg2, arg3)
    {
        super('WebGL', options, arg2, arg3);

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

        // TODO legacy!

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

        this.globalUniforms = new UniformGroup({
            projectionMatrix: new Matrix(),
        }, true);

        this.addSystem(MaskSystem, 'mask')
            .addSystem(ContextSystem, 'context')
            .addSystem(StateSystem, 'state')
            .addSystem(ShaderSystem, 'shader')
            .addSystem(TextureSystem, 'texture')
            .addSystem(GeometrySystem, 'geometry')
            .addSystem(FramebufferSystem, 'framebuffer')
            .addSystem(StencilSystem, 'stencil')
            .addSystem(ProjectionSystem, 'projection')
            .addSystem(TextureGCSystem, 'textureGC')
            .addSystem(FilterSystem, 'filter')
            .addSystem(RenderTextureSystem, 'renderTexture')
            .addSystem(BatchSystem, 'batch');

        this.initPlugins(Renderer.__plugins);

        /**
         * The options passed in to create a new webgl context.
         *
         * @member {object}
         * @private
         */
        if (options.context)
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
                powerPreference: this.options.powerPreference,
            });
        }

        this.renderingToScreen = true;

        sayHello(this.context.webGLVersion === 2 ? 'WebGL 2' : 'WebGL 1');

        this.resize(this.options.width, this.options.height);
    }

    /**
     * Add a new system to the renderer.
     * @param {class} ClassRef - Class reference
     * @param {string} [name] - Property name for system, if not specified
     *        will use a static `name` property on the class itself. This
     *        name will be assigned as s property on the Renderer so make
     *        sure it doesn't collide with properties on Renderer.
     * @return {PIXI.Renderer} Return instance of renderer
     */
    addSystem(ClassRef, name)
    {
        if (!name)
        {
            name = ClassRef.name;
        }

        // TODO - read name from class.name..

        /*
        if(name.includes('System'))
        {
            name = name.replace('System', '');
            name = name.charAt(0).toLowerCase() + name.slice(1);
        }
        */

        const system = new ClassRef(this);

        if (this[name])
        {
            throw new Error(`Whoops! ${name} is already a manger`);
        }

        this[name] = system;

        for (const i in this.runners)
        {
            this.runners[i].add(system);
        }

        return this;

        /**
         * Fired after rendering finishes.
         *
         * @event PIXI.Renderer#postrender
         */

        /**
         * Fired before rendering starts.
         *
         * @event PIXI.Renderer#prerender
         */

        /**
         * Fired when the WebGL context is set.
         *
         * @event PIXI.Renderer#context
         * @param {WebGLRenderingContext} gl - WebGL context.
         */
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
        if (this.context.isLost)
        {
            return;
        }

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

        displayObject.render(this);

        // apply transform..
        this.batch.currentRenderer.flush();

        if (renderTexture)
        {
            renderTexture.baseTexture.update();
        }

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
        AbstractRenderer.prototype.resize.call(this, screenWidth, screenHeight);

        this.runners.resize.run(screenWidth, screenHeight);
    }

    /**
     * Resets the WebGL state so you can render things however you fancy!
     *
     * @return {PIXI.Renderer} Returns itself.
     */
    reset()
    {
        this.runners.reset.run();

        return this;
    }

    clear()
    {
        this.framebuffer.bind();
        this.framebuffer.clear();
    }

    /**
     * Removes everything from the renderer (event listeners, spritebatch, etc...)
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     *  See: https://github.com/pixijs/pixi.js/issues/2233
     */
    destroy(removeView)
    {
        this.runners.destroy.run();

        // call base destroy
        super.destroy(removeView);

        // TODO nullify all the managers..
        this.gl = null;
    }

    /**
     * Collection of installed plugins. These are included by default in PIXI, but can be excluded
     * by creating a custom build. Consult the README for more information about creating custom
     * builds and excluding plugins.
     * @name PIXI.Renderer#plugins
     * @type {object}
     * @readonly
     * @property {PIXI.accessibility.AccessibilityManager} accessibility Support tabbing interactive elements.
     * @property {PIXI.extract.WebGLExtract} extract Extract image data from renderer.
     * @property {PIXI.interaction.InteractionManager} interaction Handles mouse, touch and pointer events.
     * @property {PIXI.prepare.WebGLPrepare} prepare Pre-render display objects.
     */

    /**
     * Adds a plugin to the renderer.
     *
     * @method
     * @param {string} pluginName - The name of the plugin.
     * @param {Function} ctor - The constructor function or class for the plugin.
     */
    static registerPlugin(pluginName, ctor)
    {
        Renderer.__plugins = Renderer.__plugins || {};
        Renderer.__plugins[pluginName] = ctor;
    }
}
