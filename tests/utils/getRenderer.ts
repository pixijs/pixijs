import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

import type { Renderer, RendererOptions } from '../../src/rendering/renderers/types';

export async function getRenderer(options: Partial<RendererOptions> = {}): Promise<Renderer>
{
    const renderer = new WebGLRenderer();

    await renderer.init({
        ...options,
        width: options.width ?? 2,
        height: options.height ?? 2,
    });

    return renderer;
}
