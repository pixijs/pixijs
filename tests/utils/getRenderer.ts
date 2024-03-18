import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';
import { WebGPURenderer } from '../../src/rendering/renderers/gpu/WebGPURenderer';
import '../../src/environment-browser/browserAll';

import type { WebGLOptions } from '../../src/rendering/renderers/gl/WebGLRenderer';
import type { WebGPUOptions } from '../../src/rendering/renderers/gpu/WebGPURenderer';

export async function getWebGLRenderer(options: Partial<WebGLOptions> = {}): Promise<WebGLRenderer>
{
    const renderer = new WebGLRenderer();

    const defaultOptions: Partial<WebGLOptions> = {
        width: 100,
        height: 100,

    };

    await renderer.init({
        ...defaultOptions,
        ...options,
    });

    return renderer;
}

export async function getWebGPURenderer(options: Partial<WebGPUOptions> = {}): Promise<WebGPURenderer>
{
    const renderer = new WebGPURenderer();

    const defaultOptions: Partial<WebGPUOptions> = {
        width: 100,
        height: 100,

    };

    await renderer.init({
        ...defaultOptions,
        ...options,
    });

    return renderer;
}
