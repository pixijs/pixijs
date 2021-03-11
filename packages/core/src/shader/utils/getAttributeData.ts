import { IAttributeData } from '../Program';
import { mapSize } from './mapSize';
import { mapType } from './mapType';

/**
 * returns the attribute data from the program
 * @private
 *
 * @param {WebGLProgram} [program] - the WebGL program
 * @param {WebGLRenderingContext} [gl] - the WebGL context
 *
 * @returns {object} the attribute data for this program
 */
export function getAttributeData(program: WebGLProgram, gl: WebGLRenderingContextBase): {[key: string]: IAttributeData}
{
    const attributes: {[key: string]: IAttributeData} = {};

    const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (let i = 0; i < totalAttributes; i++)
    {
        const attribData = gl.getActiveAttrib(program, i);
        const type = mapType(gl, attribData.type);

        /*eslint-disable */
            const data = {
                type: type,
                name: attribData.name,
                size: mapSize(type),
                location: i,
            };
            /* eslint-enable */

        attributes[attribData.name] = data;
    }

    return attributes;
}
