import { ENV } from '@pixi/constants';
import { settings } from '@pixi/settings';

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
        const canvas = settings.ADAPTER.createCanvas();

        let gl: WebGLRenderingContext | WebGL2RenderingContext;

        if (settings.PREFER_ENV >= ENV.WEBGL2)
        {
            gl = canvas.getContext('webgl2', {});
        }

        if (!gl)
        {
            gl = (canvas.getContext('webgl', {})
                || (canvas.getContext('experimental-webgl', {}) as WebGLRenderingContext));

            if (!gl)
            {
                // fail, not able to get a context
                gl = null;
            }
            else
            {
                // for shader testing..
                gl.getExtension('WEBGL_draw_buffers');
            }
        }

        context = gl;
    }

    return context;
}
