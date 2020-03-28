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
            // try antialias + stencil

            const options: any = { antialias: true, stencil: true };

            gl = canvas.getContext('webgl', options) as WebGLRenderingContext;

            if (!gl)
            {
                // Hello, windows XP mozilla!

                options.antialias = false;
                options.stencil = true;

                gl = canvas.getContext('webgl', options) as WebGLRenderingContext;
            }

            if (!gl)
            {
                options.antialias = false;
                options.stencil = false;

                gl = canvas.getContext('webgl', options) as WebGLRenderingContext;
            }

            if (!gl)
            {
                options.antialias = true;
                options.stencil = false;

                gl = canvas.getContext('webgl', options) as WebGLRenderingContext;
            }

            if (!gl)
            {
                options.antialias = true;
                options.stencil = true;

                gl = canvas.getContext('experimental-webgl', options) as WebGLRenderingContext;
            }

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
