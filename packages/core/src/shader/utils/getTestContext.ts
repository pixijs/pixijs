import { settings } from '../../settings';
import { ENV } from '@pixi/constants';

const unknownContext = {};
let context: WebGL2RenderingContext = unknownContext as any;

/**
 * returns a little WebGL context to use for program inspection.
 *
 * @static
 * @private
 * @returns {WebGLRenderingContext} a gl context to test with
 */
export function getTestContext(): WebGL2RenderingContext
{
    if (context === unknownContext || (context && context.isContextLost()))
    {
        const canvas = document.createElement('canvas');

        let gl: any;

        if (settings.PREFER_ENV >= ENV.WEBGL2)
        {
            gl = canvas.getContext('webgl2', {});
        }

        if (!gl)
        {
            gl = canvas.getContext('webgl', {})
            || canvas.getContext('experimental-webgl', {});

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
