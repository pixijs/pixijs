import { isWebGLSupported } from '../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../utils/browser/isWebGPUSupported';
import { AbstractRenderer } from './shared/system/AbstractRenderer';

import type { CanvasOptions } from './canvas/CanvasRenderer';
import type { WebGLOptions } from './gl/WebGLRenderer';
import type { WebGPUOptions } from './gpu/WebGPURenderer';
import type { Renderer, RendererOptions } from './types';

/**
 * A renderer type string for specifying renderer preference.
 * @standard 
 */
export type RendererPreference = 'webgl' | 'webgpu' | 'canvas';

/**
 * Options for {@link autoDetectRenderer}.
 * @category rendering
 * @advanced
 */
export interface AutoDetectOptions extends RendererOptions
{
    /**
     * The preferred renderer type(s).
     *
     * - When a **string** is provided (e.g. `'webgpu'`), that renderer is tried first and
     *   the remaining renderers are used as fallbacks in the default priority order.
     * - When an **array** is provided (e.g. `['webgpu', 'webgl']`), only the listed
     *   renderers are tried, in the given order. Any renderer type **not** in the array
     *   is excluded entirely — this can be used as a blocklist.
     */
    preference?: RendererPreference | RendererPreference[];
    /** Optional WebGPUOptions to pass only to WebGPU renderer. */
    webgpu?: Partial<WebGPUOptions>;
    /** Optional WebGLOptions to pass only to the WebGL renderer */
    webgl?: Partial<WebGLOptions>;
    /** Optional CanvasOptions to pass only to the Canvas renderer */
    canvasOptions?: Partial<CanvasOptions>;
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
 *
 * // only allow webgl and canvas (exclude webgpu entirely)
 * const renderer = await autoDetectRenderer({
 *   preference: ['webgl', 'canvas'],
 * });
 * @param options - A partial configuration object based on the `AutoDetectOptions` type.
 * @returns A Promise that resolves to an instance of the selected renderer.
 * @category rendering
 * @standard
 */
export async function autoDetectRenderer(options: Partial<AutoDetectOptions>): Promise<Renderer>
{
    let preferredOrder: string[] = [];

    if (options.preference)
    {
        if (Array.isArray(options.preference))
        {
            // When an array is provided, use only those renderers in that order.
            preferredOrder = options.preference.slice();
        }
        else
        {
            // When a single string is provided, try it first then fall back to the rest.
            preferredOrder.push(options.preference);

            renderPriority.forEach((item) =>
            {
                if (item !== options.preference)
                {
                    preferredOrder.push(item);
                }
            });
        }
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
            const { CanvasRenderer } = await import('./canvas/CanvasRenderer');

            RendererClass = CanvasRenderer;

            finalOptions = { ...options, ...options.canvasOptions };

            break;
        }
    }

    delete finalOptions.webgpu;
    delete finalOptions.webgl;
    delete finalOptions.canvasOptions;

    if (!RendererClass)
    {
        throw new Error('No available renderer for the current environment');
    }

    const renderer = new RendererClass();

    await renderer.init(finalOptions);

    return renderer;
}
