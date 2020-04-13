import type { IRenderingContext } from '../../IRenderingContext';

// var GL_MAP = {};

/**
 * @param gl {WebGLRenderingContext} The current WebGL context
 * @param attribs {*}
 * @param state {*}
 * @private
 */
export function setVertexAttribArrays(gl: IRenderingContext,
    attribs: {[x: string]: any}, state: {[x: string]: any}): void
{
    let i;

    if (state)
    {
        const tempAttribState = state.tempAttribState;
        const attribState = state.attribState;

        for (i = 0; i < tempAttribState.length; i++)
        {
            tempAttribState[i] = false;
        }

        // set the new attribs
        for (i = 0; i < attribs.length; i++)
        {
            tempAttribState[attribs[i].attribute.location] = true;
        }

        for (i = 0; i < attribState.length; i++)
        {
            if (attribState[i] !== tempAttribState[i])
            {
                attribState[i] = tempAttribState[i];

                if (state.attribState[i])
                {
                    gl.enableVertexAttribArray(i);
                }
                else
                {
                    gl.disableVertexAttribArray(i);
                }
            }
        }
    }
    else
    {
        for (i = 0; i < attribs.length; i++)
        {
            const attrib = attribs[i];

            gl.enableVertexAttribArray(attrib.attribute.location);
        }
    }
}
