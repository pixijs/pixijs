import { isWebGLSupported } from '../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../utils/browser/isWebGPUSupported';
import { AbstractRenderer } from './shared/system/AbstractRenderer';

import type { WebGLOptions } from './gl/WebGLRenderer';
import type { WebGPUOptions } from './gpu/WebGPURenderer';
import type { Renderer, RendererOptions } from './types';

/**
 * Options for {@link rendering.autoDetectRenderer}.
 * @memberof rendering
 */
export interface AutoDetectOptions extends RendererOptions
{
    /** The preferred renderer type. WebGPU is recommended as its generally faster than WebGL. */
    preference?: 'webgl' | 'webgpu'// | 'canvas';
    /** Optional WebGPUOptions to pass only to WebGPU renderer. */
    webgpu?: Partial<WebGPUOptions>;
    /** Optional WebGLOptions to pass only to the WebGL renderer */
    webgl?: Partial<WebGLOptions>;
}

const renderPriority = ['webgl', 'webgpu', 'canvas'];

/**
 * Automatically determines the most appropriate renderer for the current environment.
 *
 * The function will prioritize the WebGL renderer as it is the most tested safe API to use.
 * In the near future as WebGPU becomes more stable and ubiquitous, it will be prioritized over WebGL.
 *
 * The selected renderer's code is then dynamically imported to optimize
 * performance and minimize the initial bundle size.
 *
 * To maximize the benefits of dynamic imports, it's recommended to use a modern bundler
 * that supports code splitting. This will place the renderer code in a separate chunk,
 * which is loaded only when needed.
 * @example
 *
 * // create a renderer
 * const renderer = await autoDetectRenderer({
 *   width: 800,
 *   height: 600,
 *   antialias: true,
 * });
 *
 * // custom for each renderer
 * const renderer = await autoDetectRenderer({
 *   width: 800,
 *   height: 600,
 *   webgpu:{
 *     antialias: true,
 *     backgroundColor: 'red'
 *   },
 *   webgl:{
 *     antialias: true,
 *     backgroundColor: 'green'
 *   }
 *  });
 * @param options - A partial configuration object based on the `AutoDetectOptions` type.
 * @returns A Promise that resolves to an instance of the selected renderer.
 * @memberof rendering
 */
export async function autoDetectRenderer(options: Partial<AutoDetectOptions>): Promise<Renderer>
{
    let preferredOrder: string[] = [];

    if (options.preference)
    {
        preferredOrder.push(options.preference);

        renderPriority.forEach((item) =>
        {
            if (item !== options.preference)
            {
                preferredOrder.push(item);
            }
        });
    }
    else
    {
        preferredOrder = renderPriority.slice();
    }

    let RendererClass: new () => Renderer;
    let finalOptions: Partial<AutoDetectOptions> = {};

    for (let i = 0; i < preferredOrder.length; i++)
    {
        const rendererType = preferredOrder[i];

        if (rendererType === 'webgpu' && (await isWebGPUSupported()))
        {
            const { WebGPURenderer } = await import('./gpu/WebGPURenderer');

            RendererClass = WebGPURenderer;

            finalOptions = { ...options, ...options.webgpu };

            break;
        }
        else if (
            rendererType === 'webgl'
            && isWebGLSupported(
                options.failIfMajorPerformanceCaveat
                    ?? AbstractRenderer.defaultOptions.failIfMajorPerformanceCaveat
            )
        )
        {
            const { WebGLRenderer } = await import('./gl/WebGLRenderer');

            RendererClass = WebGLRenderer;

            finalOptions = { ...options, ...options.webgl };

            break;
        }
        else if (rendererType === 'canvas')
        {
            finalOptions = { ...options };

            throw new Error('CanvasRenderer is not yet implemented');
        }
    }

    delete finalOptions.webgpu;
    delete finalOptions.webgl;

    if (!RendererClass)
    {
        throw new Error('No available renderer for the current environment');
    }

    const renderer = new RendererClass();

    await renderer.init(finalOptions);

    return renderer;
}
