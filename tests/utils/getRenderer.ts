import { WebGLRenderer } from '../../src/rendering/renderers/gl/WebGLRenderer';

import type { Renderer } from '../../src/rendering/renderers/types';

export async function getRenderer(): Promise<Renderer>
{
    const renderer = new WebGLRenderer();

    await renderer.init({
        width: 100,
        height: 100,
    });

    return renderer;
}
