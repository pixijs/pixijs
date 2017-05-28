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
        const options = {};

        canvas.width = 1;
        canvas.height = 1;


        context = canvas.getContext('webgl', options)
               || canvas.getContext('experimental-webgl', options);


        //canvas.getContext('webgl2', options)
        var xt = context.getExtension('WEBGL_draw_buffers');


        if (!context)
        {
            // fail, not able to get a context
            throw new Error('This browser does not support webGL. Try using the canvas renderer');
        }
    }

    return context;
}
