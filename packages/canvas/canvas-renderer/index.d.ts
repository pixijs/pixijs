import { AbstractRenderer } from '@pixi/core';
import type { BaseRenderTexture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import type { Container } from '@pixi/display';
import type { DisplayObject } from '@pixi/display';
import type { Graphics } from '@pixi/graphics';
import type { IRendererOptions } from '@pixi/core';
import type { IRendererPlugin } from '@pixi/core';
import type { IRendererPlugins } from '@pixi/core';
import type { MaskData } from '@pixi/core';
import { Matrix } from '@pixi/math';
import type { RenderTexture } from '@pixi/core';
import type { Texture } from '@pixi/core';

/**
 * Checks whether the Canvas BlendModes are supported by the current browser
 *
 * @private
 * @return {boolean} whether they are supported
 */
export declare function canUseNewCanvasBlendModes(): boolean;

/**
 * A set of functions used to handle masking.
 *
 * Sprite masking is not supported on the CanvasRenderer.
 *
 * @class
 * @memberof PIXI
 */
declare class CanvasMaskManager {
    private renderer;
    private _foundShapes;
    /**
     * @param {PIXI.CanvasRenderer} renderer - The canvas renderer.
     */
    constructor(renderer: CanvasRenderer);
    /**
     * This method adds it to the current stack of masks.
     *
     * @param {PIXI.MaskData | PIXI.Graphics} maskData - the maskData that will be pushed
     */
    pushMask(maskData: MaskData | Graphics): void;
    /**
     * Renders all PIXI.Graphics shapes in a subtree.
     *
     * @param {PIXI.Container} container - container to scan.
     * @param {PIXI.Graphics[]} out - where to put found shapes
     */
    recursiveFindShapes(container: Container, out: Array<Graphics>): void;
    /**
     * Renders a PIXI.Graphics shape.
     *
     * @param {PIXI.Graphics} graphics - The object to render.
     */
    renderGraphicsShape(graphics: Graphics): void;
    /**
     * Restores the current drawing context to the state it was before the mask was applied.
     *
     * @param {PIXI.CanvasRenderer} renderer - The renderer context to use.
     */
    popMask(renderer: CanvasRenderer): void;
    /**
     * Destroys this canvas mask manager.
     *
     */
    destroy(): void;
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
export declare class CanvasRenderer extends AbstractRenderer {
    readonly rootContext: CrossPlatformCanvasRenderingContext2D;
    context: CrossPlatformCanvasRenderingContext2D;
    refresh: boolean;
    maskManager: CanvasMaskManager;
    smoothProperty: SmoothingEnabledProperties;
    readonly blendModes: string[];
    renderingToScreen: boolean;
    private _activeBlendMode;
    private _projTransform;
    _outerBlend: boolean;
    /**
     * @param {object} [options] - The optional renderer parameters
     * @param {number} [options.width=800] - the width of the screen
     * @param {number} [options.height=600] - the height of the screen
     * @param {HTMLCanvasElement} [options.view] - the canvas to use as a view, optional
     * @param {boolean} [options.transparent=false] - If the render view is transparent, default false
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
     */
    constructor(options?: IRendererOptions);
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
    render(displayObject: DisplayObject, renderTexture?: RenderTexture | BaseRenderTexture, clear?: boolean, transform?: Matrix, skipUpdateTransform?: boolean): void;
    /**
     * sets matrix of context
     * called only from render() methods
     * takes care about resolution
     * @param {PIXI.Matrix} transform - world matrix of current element
     * @param {boolean} [roundPixels] - whether to round (tx,ty) coords
     * @param {number} [localResolution] - If specified, used instead of `renderer.resolution` for local scaling
     */
    setContextTransform(transform: Matrix, roundPixels?: boolean, localResolution?: number): void;
    /**
     * Clear the canvas of renderer.
     *
     * @param {string} [clearColor] - Clear the canvas with this color, except the canvas is transparent.
     */
    clear(clearColor: string): void;
    /**
     * Sets the blend mode of the renderer.
     *
     * @param {number} blendMode - See {@link PIXI.BLEND_MODES} for valid values.
     * @param {boolean} [readyForOuterBlend=false] - Some blendModes are dangerous, they affect outer space of sprite.
     * Pass `true` only if you are ready to use them.
     */
    setBlendMode(blendMode: BLEND_MODES, readyForOuterBlend?: boolean): void;
    /**
     * Removes everything from the renderer and optionally removes the Canvas DOM element.
     *
     * @param {boolean} [removeView=false] - Removes the Canvas element from the DOM.
     */
    destroy(removeView?: boolean): void;
    /**
     * Resizes the canvas view to the specified width and height.
     *
     * @extends PIXI.AbstractRenderer#resize
     *
     * @param {number} screenWidth - the new width of the screen
     * @param {number} screenHeight - the new height of the screen
     */
    resize(screenWidth: number, screenHeight: number): void;
    /**
     * Checks if blend mode has changed.
     */
    invalidateBlendMode(): void;
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
    static registerPlugin(pluginName: string, ctor: ICanvasRendererPluginConstructor): void;
}

/**
 * Utility methods for Sprite/Texture tinting.
 *
 * Tinting with the CanvasRenderer involves creating a new canvas to use as a texture,
 * so be aware of the performance implications.
 *
 * @namespace PIXI.canvasUtils
 * @memberof PIXI
 */
export declare const canvasUtils: {
    canvas: HTMLCanvasElement;
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Sprite} sprite - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedCanvas: (sprite: {
        texture: Texture;
    }, color: number) => HTMLCanvasElement | HTMLImageElement;
    /**
     * Basically this method just needs a sprite and a color and tints the sprite with the given color.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the sprite to tint
     * @param {number} color - the color to use to tint the sprite with
     * @return {HTMLCanvasElement} The tinted canvas
     */
    getTintedPattern: (texture: Texture, color: number) => CanvasPattern;
    /**
     * Tint a texture using the 'multiply' operation.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithMultiply: (texture: Texture, color: number, canvas: HTMLCanvasElement) => void;
    /**
     * Tint a texture using the 'overlay' operation.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithOverlay: (texture: Texture, color: number, canvas: HTMLCanvasElement) => void;
    /**
     * Tint a texture pixel per pixel.
     *
     * @memberof PIXI.canvasUtils
     * @param {PIXI.Texture} texture - the texture to tint
     * @param {number} color - the color to use to tint the sprite with
     * @param {HTMLCanvasElement} canvas - the current canvas
     */
    tintWithPerPixel: (texture: Texture, color: number, canvas: HTMLCanvasElement) => void;
    /**
     * Rounds the specified color according to the canvasUtils.cacheStepsPerColorChannel.
     *
     * @memberof PIXI.canvasUtils
     * @param {number} color - the color to round, should be a hex color
     * @return {number} The rounded color.
     */
    roundColor: (color: number) => number;
    /**
     * Number of steps which will be used as a cap when rounding colors.
     *
     * @memberof PIXI.canvasUtils
     * @type {number}
     */
    cacheStepsPerColorChannel: number;
    /**
     * Tint cache boolean flag.
     *
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    convertTintToImage: boolean;
    /**
     * Whether or not the Canvas BlendModes are supported, consequently the ability to tint using the multiply method.
     *
     * @memberof PIXI.canvasUtils
     * @type {boolean}
     */
    canUseMultiply: boolean;
    /**
     * The tinting method that will be used.
     *
     * @memberof PIXI.canvasUtils
     * @type {Function}
     */
    tintMethod: (texture: Texture, color: number, canvas: HTMLCanvasElement) => void;
};

/**
 * Renderering context for all browsers. This includes platform-specific
 * properties that are not included in the spec for CanvasRenderingContext2D
 * @private
 */
export declare interface CrossPlatformCanvasRenderingContext2D extends CanvasRenderingContext2D {
    webkitImageSmoothingEnabled: boolean;
    mozImageSmoothingEnabled: boolean;
    oImageSmoothingEnabled: boolean;
    msImageSmoothingEnabled: boolean;
}

export declare interface ICanvasRendererPluginConstructor {
    new (renderer: CanvasRenderer, options?: any): IRendererPlugin;
}

export declare interface ICanvasRendererPlugins {
    [key: string]: any;
}

declare type SmoothingEnabledProperties = 'imageSmoothingEnabled' | 'webkitImageSmoothingEnabled' | 'mozImageSmoothingEnabled' | 'oImageSmoothingEnabled' | 'msImageSmoothingEnabled';

export { }
