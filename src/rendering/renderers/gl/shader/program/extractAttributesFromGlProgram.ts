import { getAttributeInfoFromFormat } from '../../../shared/geometry/utils/getAttributeInfoFromFormat';
import { mapGlToVertexFormat } from './mapType';

import type { Attribute } from '../../../shared/geometry/Geometry';

export interface ExtractedAttributeData extends Omit<Attribute, 'buffer'>
{
    /** set where the shader location is for this attribute */
    location?: number;
}

/**
 * returns the attribute data from the program
 * @private
 * @param {WebGLProgram} [program] - the WebGL program
 * @param {WebGLRenderingContext} [gl] - the WebGL context
 * @returns {object} the attribute data for this program
 */

export function extractAttributesFromGlProgram(
    program: WebGLProgram,
    gl: WebGLRenderingContextBase,
    sortAttributes = false
): Record<string, ExtractedAttributeData>
{
    const attributes: {[key: string]: ExtractedAttributeData} = {};

    const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < totalAttributes; i++)
    {
        const attribData = gl.getActiveAttrib(program, i);

        // ignore the default ones!
        if (attribData.name.startsWith('gl_'))
        {
            continue;
        }

        const format = mapGlToVertexFormat(gl, attribData.type);

        attributes[attribData.name] = {
            location: 0, // set further down..
            format,
            stride: getAttributeInfoFromFormat(format).stride,
            offset: 0,
            instance: false,
            start: 0,
        };
    }

    const keys = Object.keys(attributes);

    if (sortAttributes)
    {
        keys.sort((a, b) => (a > b) ? 1 : -1); // eslint-disable-line no-confusing-arrow

        for (let i = 0; i < keys.length; i++)
        {
            attributes[keys[i]].location = i;

            gl.bindAttribLocation(program, i, keys[i]);
        }

        gl.linkProgram(program);
    }
    else
    {
        for (let i = 0; i < keys.length; i++)
        {
            attributes[keys[i]].location = gl.getAttribLocation(program, keys[i]);
        }
    }

    return attributes;
}
