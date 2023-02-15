import { extensions, ExtensionType } from '@pixi/extensions';

import type { ICanvas } from '@pixi/settings';
import type { IRenderer, IRendererOptions } from './IRenderer';

/**
 * Renderer options supplied to `autoDetectRenderer`.
 * @memberof PIXI
 */
export interface IRendererOptionsAuto extends IRendererOptions
{
    /**
     * Force CanvasRenderer even if WebGL is supported. Only available with **pixi.js-legacy**.
     * @default false
     */
    forceCanvas?: boolean;
}

export interface IRendererConstructor<VIEW extends ICanvas = ICanvas>
{
    test(options?: Partial<IRendererOptionsAuto>): boolean;
    new (options?: Partial<IRendererOptionsAuto>): IRenderer<VIEW>;
}

/**
 * Collection of installed Renderers.
 * @ignore
 */
const renderers: IRendererConstructor<ICanvas>[] = [];

extensions.handleByList(ExtensionType.Renderer, renderers);

/**
 * This helper function will automatically detect which renderer you should be using.
 * WebGL is the preferred renderer as it is a lot faster. If WebGL is not supported by
 * the browser then this function will return a canvas renderer.
 * @memberof PIXI
 * @function autoDetectRenderer
 * @param options - Options to use.
 */
export function autoDetectRenderer<VIEW extends ICanvas = ICanvas>(options?: Partial<IRendererOptionsAuto>): IRenderer<VIEW>
{
    for (const RendererType of renderers)
    {
        if (RendererType.test(options))
        {
            return new RendererType(options) as IRenderer<VIEW>;
        }
    }

    throw new Error('Unable to auto-detect a suitable renderer.');
}
