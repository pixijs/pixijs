import { getAttributeInfoFromFormat } from '../../../shared/geometry/utils/getAttributeInfoFromFormat';
import { mapGlToVertexFormat } from './mapType';

import type { Attribute } from '../../../shared/geometry/Geometry';

/**
 * This interface represents the extracted attribute data from a WebGL program.
 * It extends the `Attribute` interface but omits the `buffer` property.
 * It includes an optional `location` property that indicates where the shader location is for this attribute.
 * @category rendering
 * @advanced
 */
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
            location: 0, // set further down..
            format,
            stride: getAttributeInfoFromFormat(format).stride,
            offset: 0,
            instance: false,
            start: 0,
        };
    }

    const keys = Object.keys(attributes);

    // use the GL-assigned attribute locations; setting them with bindAttribLocation
    // renders blank (no GL error) on some Adreno/ANGLE WebGL1 drivers
    for (let i = 0; i < keys.length; i++)
    {
        attributes[keys[i]].location = gl.getAttribLocation(program, keys[i]);
    }

    return attributes;
}
