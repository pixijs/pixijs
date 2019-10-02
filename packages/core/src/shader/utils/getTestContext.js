import { settings } from '../../settings';
import { ENV } from '@pixi/constants';

const unknownContext = {};
let context = unknownContext;

/**
 * returns a little WebGL context to use for program inspection.
 *
 * @static
 * @private
 * @returns {WebGLRenderingContext} a gl context to test with
 */
export function getTestContext()
{
    if (context === unknownContext || (context && context.isContextLost()))
    {
        const canvas = document.createElement('canvas');

        let gl;

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
