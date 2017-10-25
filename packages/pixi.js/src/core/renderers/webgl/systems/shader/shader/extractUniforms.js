import mapType from './mapType';
import defaultValue from './defaultValue';

/**
 * Extracts the uniforms
 * @method extractUniforms
 * @memberof PIXI.glCore.shader
 * @param gl {WebGLRenderingContext} The current WebGL rendering context
 * @param program {WebGLProgram} The shader program to get the uniforms from
 * @return uniforms {Object}
 */
export default function extractUniforms(gl, program)
{
    const uniforms = {};

    const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < totalUniforms; i++)
    {
        const uniformData = gl.getActiveUniform(program, i);
        const name = uniformData.name.replace(/\[.*?\]/, '');
        const type = mapType(gl, uniformData.type);

        uniforms[name] = {
            type,
            size: uniformData.size,
            location: gl.getUniformLocation(program, name),
            value: defaultValue(type, uniformData.size),
        };
    }

    return uniforms;
}
