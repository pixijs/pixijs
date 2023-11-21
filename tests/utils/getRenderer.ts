import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

import type { WebGLOptions } from '../../src/rendering/renderers/gl/WebGLRenderer';
import type { Renderer } from '../../src/rendering/renderers/types';

export async function getRenderer(options: Partial<WebGLOptions> = {}): Promise<Renderer>
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
