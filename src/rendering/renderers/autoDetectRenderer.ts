import { isWebGLSupported } from '../../utils/browser/isWebGLSupported';
import { isWebGPUSupported } from '../../utils/browser/isWebGPUSupported';

import type { WebGLRendererOptions } from './gl/WebGLRenderer';
import type { WebGPURendererOptions } from './gpu/WebGPURenderer';
import type { Renderer } from './types';

export interface AutoDetectOptions extends SharedOptions
{
    preference?: 'webgl' | 'webgpu' | 'canvas';
    webgl?: Partial<GLOnlyOptions>,
    webgpu?: Partial<GPUOnlyOptions>,
}

type GLOnlyOptions = Pick<WebGLRendererOptions, Exclude<keyof WebGLRendererOptions, keyof WebGPURendererOptions>>;
type GPUOnlyOptions = Pick<WebGPURendererOptions, Exclude<keyof WebGPURendererOptions, keyof WebGLRendererOptions>>;
type SharedOptions = Omit<RendererOptions, keyof GLOnlyOptions | keyof GPUOnlyOptions>;

export type RendererOptions = WebGLRendererOptions | WebGPURendererOptions;

const renderPriority = ['webgpu', 'webgl', 'canvas'];

export async function autoDetectRenderer(options: Partial<AutoDetectOptions>): Promise<Renderer>
{
    let preferredOrder: string[] = [];
    let specificOptions: GLOnlyOptions | GPUOnlyOptions;
    const { webgl, webgpu, ...rest } = options;

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

    for (let i = 0; i < preferredOrder.length; i++)
    {
        const rendererType = preferredOrder[i];

        if (rendererType === 'webgpu' && isWebGPUSupported())
        {
            const { WebGPURenderer } = await import('./gpu/WebGPURenderer');

            RendererClass = WebGPURenderer;
            specificOptions = webgpu;
            break;
        }
        else if (rendererType === 'webgl' && isWebGLSupported())
        {
            const { WebGLRenderer } = await import('./gl/WebGLRenderer');

            RendererClass = WebGLRenderer;
            specificOptions = webgl;

            break;
        }
        else if (rendererType === 'canvas')
        {
            break;
        }
    }

    const renderer = new RendererClass();

    await renderer.init({ ...rest, ...specificOptions } as RendererOptions);

    return renderer;
}
