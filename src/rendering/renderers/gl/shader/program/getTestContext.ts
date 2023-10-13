import { DOMAdapter } from '../../../../../environment/adapter';

const unknownContext = {};
let context: WebGLRenderingContext | WebGL2RenderingContext = unknownContext as any;

/**
 * returns a little WebGL context to use for program inspection.
 * @static
 * @private
 * @returns {WebGLRenderingContext} a gl context to test with
 */
export function getTestContext(): WebGLRenderingContext | WebGL2RenderingContext
{
    if (context === unknownContext || context?.isContextLost())
    {
        const canvas = DOMAdapter.get().createCanvas();

        context = canvas.getContext('webgl2', {});
    }

    return context;
}
