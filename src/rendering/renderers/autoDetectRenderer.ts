import { isWebGLSupported } from '../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../utils/browser/isWebGPUSupported';

import type { WebGLOptions } from './gl/WebGLRenderer';
import type { WebGPUOptions } from './gpu/WebGPURenderer';
import type { Renderer } from './types';

export interface AutoDetectOptions extends WebGLOptions, WebGPUOptions
{
    preference?: 'webgl' | 'webgpu' | 'canvas';
    manageImports?: boolean;
    webgpu?: Partial<WebGPUOptions>;
    webgl?: Partial<WebGLOptions>;
}

const renderPriority = ['webgpu', 'webgl', 'canvas'];

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

    if (options.manageImports ?? true)
    {
        await import('../../all');
    }

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
        else if (rendererType === 'webgl' && isWebGLSupported())
        {
            const { WebGLRenderer } = await import('./gl/WebGLRenderer');

            RendererClass = WebGLRenderer;

            finalOptions = { ...options, ...options.webgl };

            break;
        }
        else if (rendererType === 'canvas')
        {
            finalOptions = { ...options };

            break;
        }
    }

    delete finalOptions.webgpu;
    delete finalOptions.webgl;

    const renderer = new RendererClass();

    await renderer.init(finalOptions);

    return renderer;
}
