import { Rectangle } from '@pixi/math';
import { EventEmitter } from '@pixi/utils';
import { IGenerateTextureOptions, IRendererPlugins, IRendererRenderOptions } from './AbstractRenderer';
import { IRenderableObject } from './IRenderableObject';

export interface IRenderer extends EventEmitter
{
    resize(width: number, height: number): void;
    render(displayObject: IRenderableObject, options?: IRendererRenderOptions): void
    generateTexture(displayObject: IRenderableObject, options?: IGenerateTextureOptions): void

    destroy(options: any): void;
    clear(): void;
    reset(): void;

    readonly resolution: number
    readonly width: number
    readonly height: number
    readonly view: HTMLCanvasElement
    readonly screen: Rectangle
    readonly renderingToScreen: boolean

    // TODO remove or rename..
    readonly _lastObjectRendered: IRenderableObject

    readonly plugins: IRendererPlugins
}
