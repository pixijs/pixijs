import { Program } from '../Program';
import type { IRenderingContext } from '../../IRenderingContext';
import type { IGLUniformData } from '../GLProgram';
import { GLProgram } from '../GLProgram';
import { compileShader } from './compileShader';
import { defaultValue } from './defaultValue';
import { getAttributeData } from './getAttributeData';
import { getUniformData } from './getUniformData';
import { logProgramError } from './logProgramError';

/**
 * generates a WebGL Program object from a high level Pixi Program.
 *
 * @param gl - a rendering context on which to generate the program
 * @param program - the high level Pixi Program.
 */
export function generateProgram(gl: IRenderingContext, program: Program): GLProgram
{
    const glVertShader = compileShader(gl, gl.VERTEX_SHADER, program.vertexSrc);
    const glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, program.fragmentSrc);

    const webGLProgram = gl.createProgram();

    gl.attachShader(webGLProgram, glVertShader);
    gl.attachShader(webGLProgram, glFragShader);

    gl.linkProgram(webGLProgram);

    if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS))
    {
        logProgramError(gl, webGLProgram, glVertShader, glFragShader);
    }

    program.attributeData = getAttributeData(webGLProgram, gl);
    program.uniformData = getUniformData(webGLProgram, gl);

    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    const uniformData: {[key: string]: IGLUniformData} = {};

    for (const i in program.uniformData)
    {
        const data = program.uniformData[i];

        uniformData[i] = {
            location: gl.getUniformLocation(webGLProgram, i),
            value: defaultValue(data.type, data.size),
        };
    }

    const glProgram = new GLProgram(webGLProgram, uniformData);

    return glProgram;
}
