import type { RENDERER_TYPE } from '@pixi/constants';
import type { Matrix, Rectangle, Transform } from '@pixi/math';
import type { ICanvas } from '@pixi/settings';
import type { IRendererPlugins } from './plugin/PluginSystem';
import type { IGenerateTextureOptions } from './renderTexture/GenerateTextureSystem';
import type { RenderTexture } from './renderTexture/RenderTexture';
import type { SystemManager } from './system/SystemManager';
import type { ImageSource } from './textures/BaseTexture';

/**
 * Interface for DisplayObject to interface with Renderer.
 * The minimum APIs needed to implement a renderable object.
 * @memberof PIXI
 */
export interface IRenderableObject extends GlobalMixins.IRenderableObject
{
    /** Object must have a parent container */
    parent: IRenderableContainer;
    /** Object must have a transform */
    transform: Transform;
    /** Before method for transform updates */
    enableTempParent(): IRenderableContainer;
    /** Update the transforms */
    updateTransform(): void;
    /** After method for transform updates */
    disableTempParent(parent: IRenderableContainer): void;
    /** Render object directly */
    render(renderer: IRenderer): void;
}

/**
 * Interface for Container to interface with Renderer.
 * @memberof PIXI
 */
export interface IRenderableContainer extends IRenderableObject
{
    /** Get Local bounds for container */
    getLocalBounds(rect?: Rectangle, skipChildrenUpdate?: boolean): Rectangle;
}

/**
 * Mixed WebGL1 / WebGL2 rendering context. Either it's WebGL2, either it's WebGL1 with PixiJS polyfills on it.
 * @memberof PIXI
 */
export interface IRenderingContext extends WebGL2RenderingContext
{
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint,
        format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, format: GLenum, type: GLenum,
        source: TexImageSource | ImageSource): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint,
        format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint,
        format: GLenum, type: GLenum, source: TexImageSource | ImageSource): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint,
        format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: GLuint): void;

    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei,
        format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, format: GLenum, type: GLenum,
        source: TexImageSource | ImageSource): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei,
        format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei,
        format: GLenum, type: GLenum, source: TexImageSource | ImageSource): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei,
        format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: GLuint): void;

    texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint,
        width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint,
        width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum,
        source: TexImageSource | ImageSource): void;
    texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint,
        width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum,
        srcData: ArrayBufferView | null, srcOffset?: GLuint): void;
}

/**
 * Renderer options supplied to constructor.
 * @memberof PIXI
 * @see PIXI.settings.RENDER_OPTIONS
 */
export interface IRendererOptions extends GlobalMixins.IRendererOptions
{
    /** The canvas to use as the view. If omitted, a new canvas will be created. */
    view?: ICanvas;
    /**
     * The width of the renderer's view.
     * @default 800
     */
    width?: number;
    /**
     * The height of the renderer's view.
     * @default 600
     */
    height?: number;
    /**
     * The resolution / device pixel ratio of the renderer.
     * @default PIXI.settings.RESOLUTION
     */
    resolution?: number;
    /**
     * Whether the CSS dimensions of the renderer's view should be resized automatically.
     * @default false
     */
    autoDensity?: boolean;

    /**
     * The background color used to clear the canvas. It accepts hex numbers (e.g. `0xff0000`),
     * hex strings (e.g. `'#f00'` or `'#ff0000'`) or color names (e.g. `'red'`).
     * @default 0x000000
     */
    backgroundColor?: number | string;
    /** Alias for `backgroundColor`. */
    background?: number | string;
    /**
     * Transparency of the background color, value from `0` (fully transparent) to `1` (fully opaque).
     * @default 1
     */
    backgroundAlpha?: number;
    /**
     * **Deprecated since 7.0.0, use `premultipliedAlpha` and `backgroundAlpha` instead.**
     *
     * Pass-through value for canvas' context attribute `alpha`. This option is for cases where the
     * canvas needs to be opaque, possibly for performance reasons on some older devices.
     * If you want to set transparency, please use `backgroundAlpha`.
     *
     * **WebGL Only:** When set to `'notMultiplied'`, the canvas' context attribute `alpha` will be
     * set to `true` and `premultipliedAlpha` will be to `false`.
     * @default true
     * @deprecated since 7.0.0
     */
    useContextAlpha?: boolean | 'notMultiplied';
    /**
     * Whether to clear the canvas before new render passes.
     * @default true
     */
    clearBeforeRender?: boolean;

    /** **WebGL Only.** User-provided WebGL rendering context object. */
    context?: IRenderingContext;
    /**
     * **WebGL Only.** Whether to enable anti-aliasing. This may affect performance.
     * @default false
     */
    antialias?: boolean;
    /**
     * **WebGL Only.** A hint indicating what configuration of GPU is suitable for the WebGL context,
     * can be `'default'`, `'high-performance'` or `'low-power'`.
     * Setting to `'high-performance'` will prioritize rendering performance over power consumption,
     * while setting to `'low-power'` will prioritize power saving over rendering performance.
     */
    powerPreference?: WebGLPowerPreference;
    /**
     * **WebGL Only.** Whether the compositor will assume the drawing buffer contains colors with premultiplied alpha.
     * @default true
     */
    premultipliedAlpha?: boolean;
    /**
     * **WebGL Only.** Whether to enable drawing buffer preservation. If enabled, the drawing buffer will preserve
     * its value until cleared or overwritten. Enable this if you need to call `toDataUrl` on the WebGL context.
     * @default false
     */
    preserveDrawingBuffer?: boolean;

    /**
     * Whether to log the version and type information of renderer to console.
     * @default false
     */
    hello?: boolean;
}

export interface IRendererRenderOptions
{
    renderTexture?: RenderTexture;
    blit?: boolean
    clear?: boolean;
    transform?: Matrix;
    skipUpdateTransform?: boolean;
}

/**
 * Starard Interface for a Pixi renderer.
 * @memberof PIXI
 */
export interface IRenderer<VIEW extends ICanvas = ICanvas> extends SystemManager, GlobalMixins.IRenderer
{
    resize(width: number, height: number): void;
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void;
    generateTexture(displayObject: IRenderableObject, options?: IGenerateTextureOptions): RenderTexture;
    destroy(removeView?: boolean): void;
    clear(): void;
    reset(): void;

    /**
     * The type of the renderer.
     * @see PIXI.RENDERER_TYPE
     */
    readonly type: RENDERER_TYPE

    /**
     * The options passed in to create a new instance of the renderer.
     * @type {PIXI.IRendererOptions}
     */
    readonly options: IRendererOptions

    /** When logging Pixi to the console, this is the name we will show */
    readonly rendererLogId: string

    /** The canvas element that everything is drawn to.*/
    readonly view: VIEW
    /** Flag if we are rendering to the screen vs renderTexture */
    readonly renderingToScreen: boolean
    /** The resolution / device pixel ratio of the renderer. */
    readonly resolution: number
    /** the width of the screen */
    readonly width: number
    /** the height of the screen */
    readonly height: number
    /**
     * Measurements of the screen. (0, 0, screenWidth, screenHeight).
     * Its safe to use as filterArea or hitArea for the whole stage.
     */
    readonly screen: Rectangle
    /** the last object rendered by the renderer. Useful for other plugins like interaction managers */
    readonly lastObjectRendered: IRenderableObject
    /** Collection of plugins */
    readonly plugins: IRendererPlugins
}
