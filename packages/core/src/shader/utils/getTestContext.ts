import { settings } from '@pixi/settings';
import { ENV } from '@pixi/constants';

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
    if (context === unknownContext || (context && context.isContextLost()))
    {
        let gl: WebGLRenderingContext | WebGL2RenderingContext;
        const canvas = settings.ADAPTER.createCanvas();

        if (settings.PREFER_ENV >= ENV.WEBGL2)
        {
            gl = settings.ADAPTER.getContext(canvas, 'webgl2', {}) as WebGL2RenderingContext;
        }

        if (!gl)
        {
            gl = settings.ADAPTER.getContext(canvas, 'webgl', {}) as WebGLRenderingContext
            || (settings.ADAPTER.getContext(canvas, 'experimental-webgl', {})) as WebGLRenderingContext;

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
