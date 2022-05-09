import { RENDERER_TYPE } from '@pixi/constants';
import { Matrix, Rectangle } from '@pixi/math';
import { IGenerateTextureOptions } from './GenerateTextureSystem';
import { IRenderableObject } from './IRenderableObject';
import { IRenderingContext } from './IRenderingContext';
import { IRendererPlugins } from './PluginSystem';
import { RenderTexture } from './renderTexture/RenderTexture';
import { SystemManager } from './SystemManager';

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
