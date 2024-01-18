import { mapGlToVertexFormat } from '../../../gl/shader/program/mapType';
import { getUniformInfoFromFormat } from './getUniformInfoFromFormat';

import type { Attribute } from '../../geometry/Geometry';

export type ExtractedAttributeData = Omit<Attribute, 'buffer'>;

/**
 * returns the attribute data from the program
 * @private
 * @param {WebGLProgram} [program] - the WebGL program
 * @param {WebGLRenderingContext} [gl] - the WebGL context
 * @returns {object} the attribute data for this program
 */

export function extractAttributesFromGlProgram(
    program: WebGLProgram,
    gl: WebGLRenderingContextBase
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
            location: gl.getAttribLocation(program, attribData.name),
            format,
            stride: getUniformInfoFromFormat(format).stride,
            offset: 0,
            instance: false,
            start: 0,
        };
    }

    return attributes;
}
