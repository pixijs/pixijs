import { settings } from '@pixi/settings';

let context = null;

/**
 * returns a little webGL context to use for program inspection.
 *
 * @static
 * @private
 * @returns {webGL-context} a gl context to test with
 */
export default function getTestContext()
{
    if (!context)
    {
        const canvas = document.createElement('canvas');

        let gl;

        if (settings.PREFER_WEBGL_2)
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
                throw new Error('This browser does not support webGL. Try using the canvas renderer');
            }
            else
            {
                // for shader testing..
                gl.getExtension('WEBGL_draw_buffers');
            }
        }

        context = gl;

        return gl;
    }

    return context;
}
