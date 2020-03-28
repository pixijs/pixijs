import { settings } from '../../settings';
import { ENV } from '@pixi/constants';

const unknownContext = {};
let context: WebGLRenderingContext | WebGL2RenderingContext = unknownContext as any;

/**
 * returns a little WebGL context to use for program inspection.
 *
 * @static
 * @private
 * @returns {WebGLRenderingContext} a gl context to test with
 */
export function getTestContext(): WebGLRenderingContext | WebGL2RenderingContext
{
    if (context === unknownContext || (context && context.isContextLost()))
    {
        const canvas = document.createElement('canvas');

        let gl: WebGLRenderingContext | WebGL2RenderingContext;

        if (settings.PREFER_ENV >= ENV.WEBGL2)
        {
            gl = canvas.getContext('webgl2', {});
        }

        if (!gl)
        {
            const options: any = { antialias: false, stencil: false };

            gl = canvas.getContext('webgl', options) as WebGLRenderingContext
            || canvas.getContext('experimental-webgl', options) as WebGLRenderingContext;

            if (!gl)
            {
                gl = null;
            }
            else
            {
                settings.WEBGL_DISABLE_ANTIALIAS = !options.antialias;
                settings.WEBGL_DISABLE_STENCIL = !options.stencil;
                // for shader testing..
                gl.getExtension('WEBGL_draw_buffers');
            }
        }

        context = gl;
    }

    return context;
}
