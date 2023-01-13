import type { RENDERER_TYPE } from '@pixi/constants';
import type { Matrix, Rectangle, Transform } from '@pixi/math';
import type { ICanvas } from '@pixi/settings';
import type { ColorSource } from '@pixi/utils';
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

/** Mixed WebGL1/WebGL2 Rendering Context. Either its WebGL2, either its WebGL1 with PixiJS polyfills on it */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
 */
export interface IRendererOptions extends GlobalMixins.IRendererOptions
{
    /** Width of the view */
    width?: number;
    /** Height of the view */
    height?: number;
    /** Canvas or OffscreenCanvas to use, will be created if omitted */
    view?: ICanvas;
    /**
     * Use premultipliedAlpha and backgroundAlpha instead
     * @deprecated since 7.0.0
     */
    useContextAlpha?: boolean | 'notMultiplied';
    /** Consider the resolution when resizing the view */
    autoDensity?: boolean;
    /** Antialias turn on for WebGL, impacts performance */
    antialias?: boolean;
    /** Base resolution for the Renderer */
    resolution?: number;
    /** Preserve the drawing buffer */
    preserveDrawingBuffer?: boolean;
    /** Clear the draw before render */
    clearBeforeRender?: boolean;
    /** The background color, can be number (`0xff0000`) or string (`#f00`) */
    backgroundColor?: ColorSource;
    /** Alias for `backgroundColor` */
    background?: ColorSource;
    /** Background color alpha */
    backgroundAlpha?: number;
    /** Premultiply alpha */
    premultipliedAlpha?: boolean;
    /** Power preference, for multiple GPUs */
    powerPreference?: WebGLPowerPreference;
    /** User-proviced rendering context object */
    context?: IRenderingContext;
    /** Console log the version and type of Renderer */
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
