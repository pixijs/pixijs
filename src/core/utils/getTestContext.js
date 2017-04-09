

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
    if(!context)
    {
        const canvas = document.createElement('canvas');
        const options = {};

        canvas.width = 1;
        canvas.height = 1;


        context = canvas.getContext('webgl', options) ||
        canvas.getContext('experimental-webgl', options);

        if (!context)
        {
            // fail, not able to get a context
            throw new Error('This browser does not support webGL. Try using the canvas renderer');
        }
    }

    return context;
}
