import { defaultValue } from './defaultValue';
import { mapType } from './mapType';

import type { GlUniformData } from '../GlProgram';

/**
 * returns the uniform data from the program
 * @private
 * @param program - the webgl program
 * @param gl - the WebGL context
 * @returns {object} the uniform data for this program
 */
export function getUniformData(program: WebGLProgram, gl: WebGLRenderingContextBase): {[key: string]: GlUniformData}
{
    const uniforms: {[key: string]: GlUniformData} = {};

    const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < totalUniforms; i++)
    {
        const uniformData = gl.getActiveUniform(program, i);
        const name = uniformData.name.replace(/\[.*?\]$/, '');

        const isArray = !!(uniformData.name.match(/\[.*?\]$/));

        const type = mapType(gl, uniformData.type);

        uniforms[name] = {
            name,
            index: i,
            type,
            size: uniformData.size,
            isArray,
            value: defaultValue(type, uniformData.size),
        };
    }

    return uniforms;
}
