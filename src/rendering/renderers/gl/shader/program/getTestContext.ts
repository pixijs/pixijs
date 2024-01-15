import { DOMAdapter } from '../../../../../environment/adapter';

import type { GlRenderingContext } from '../../context/GlRenderingContext';

let context: GlRenderingContext;

/**
 * returns a little WebGL context to use for program inspection.
 * @static
 * @private
 * @returns {WebGLRenderingContext} a gl context to test with
 */
export function getTestContext(): GlRenderingContext
{
    if (!context || context?.isContextLost())
    {
        const canvas = DOMAdapter.get().createCanvas();

        context = canvas.getContext('webgl', {}) as GlRenderingContext;
    }

    return context;
}
