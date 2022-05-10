import { RENDERER_TYPE } from '@pixi/constants';
import { Matrix, Rectangle } from '@pixi/math';
import { IGenerateTextureOptions } from './renderTexture/GenerateTextureSystem';
import { IRendererPlugins } from './plugin/PluginSystem';
import { RenderTexture } from './renderTexture/RenderTexture';
import { SystemManager } from './system/SystemManager';

/**
 * Interface for DisplayObject to interface with Renderer.
 * The minimum APIs needed to implement a renderable object.
 * @memberof PIXI
 */
export interface IRenderableObject {
    /** Object must have a parent container */
    parent: IRenderableContainer;
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
export interface IRenderableContainer extends IRenderableObject {
    /** Get Local bounds for container */
    getLocalBounds(rect?: Rectangle, skipChildrenUpdate?: boolean): Rectangle;
}

/**
 * Mixed WebGL1/WebGL2 Rendering Context.
 * Either its WebGL2, either its WebGL1 with PixiJS polyfills on it
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRenderingContext extends WebGL2RenderingContext
{

}

export interface IRendererOptions extends GlobalMixins.IRendererOptions {
    width?: number;
    height?: number;
    view?: HTMLCanvasElement;
    useContextAlpha?: boolean | 'notMultiplied';
    /**
     * Use `backgroundAlpha` instead.
     * @deprecated
     */
    transparent?: boolean;
    autoDensity?: boolean;
    antialias?: boolean;
    resolution?: number;
    preserveDrawingBuffer?: boolean;
    clearBeforeRender?: boolean;
    backgroundColor?: number;
    backgroundAlpha?: number;
    powerPreference?: WebGLPowerPreference;
    context?: IRenderingContext;
}

export interface IRendererRenderOptions {
    renderTexture?: RenderTexture;
    clear?: boolean;
    transform?: Matrix;
    skipUpdateTransform?: boolean;
}

export interface IRenderer extends SystemManager
{
    resize(width: number, height: number): void;
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void
    generateTexture(displayObject: IRenderableObject, options?: IGenerateTextureOptions): void
    destroy(removeView?: boolean): void;
    clear(): void;
    reset(): void;

    readonly type: RENDERER_TYPE

    readonly rendererLogId: string

    readonly view: HTMLCanvasElement
    readonly renderingToScreen: boolean

    readonly resolution: number
    readonly width: number
    readonly height: number
    readonly screen: Rectangle

    readonly lastObjectRendered: IRenderableObject

    readonly plugins: IRendererPlugins
}
