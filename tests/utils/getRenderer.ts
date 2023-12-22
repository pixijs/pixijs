import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

import type { WebGLOptions } from '../../src/rendering/renderers/gl/WebGLRenderer';
export async function getRenderer(options: Partial<WebGLOptions> = {}): Promise<WebGLRenderer>
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
