import { warn } from '../../../../../utils/logging/warn';
import { GlProgramData } from '../GlProgramData';
import { compileShader } from './compileShader';
import { defaultValue } from './defaultValue';
import { getAttributeData } from './getAttributeData';
import { getUniformBufferData } from './getUniformBufferData';
import { getUniformData } from './getUniformData';
import { logProgramError } from './logProgramError';

import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlProgram } from '../GlProgram';
import type { IGLUniformData } from '../GlProgramData';

/**
 * generates a WebGL Program object from a high level Pixi Program.
 * @param gl - a rendering context on which to generate the program
 * @param program - the high level Pixi Program.
 * @private
 */
export function generateProgram(gl: GlRenderingContext, program: GlProgram): GlProgramData
{
    const glVertShader = compileShader(gl, gl.VERTEX_SHADER, program.vertex);
    const glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, program.fragment);

    const webGLProgram = gl.createProgram();

    gl.attachShader(webGLProgram, glVertShader);
    gl.attachShader(webGLProgram, glFragShader);

    const transformFeedbackVaryings = program.transformFeedbackVaryings;

    if (transformFeedbackVaryings)
    {
        if (typeof gl.transformFeedbackVaryings !== 'function')
        {
            // #if _DEBUG
            warn(`TransformFeedback is not supported but TransformFeedbackVaryings are given.`);
            // #endif
        }
        else
        {
            gl.transformFeedbackVaryings(
                webGLProgram,
                transformFeedbackVaryings.names,
                transformFeedbackVaryings.bufferMode === 'separate'
                    ? gl.SEPARATE_ATTRIBS
                    : gl.INTERLEAVED_ATTRIBS
            );
        }
    }

    gl.linkProgram(webGLProgram);

    if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS))
    {
        logProgramError(gl, webGLProgram, glVertShader, glFragShader);
    }

    program._attributeData = getAttributeData(webGLProgram, gl);
    program._uniformData = getUniformData(webGLProgram, gl);
    program._uniformBlockData = getUniformBufferData(webGLProgram, gl);

    gl.deleteShader(glVertShader);
    gl.deleteShader(glFragShader);

    const uniformData: {[key: string]: IGLUniformData} = {};

    for (const i in program._uniformData)
    {
        const data = program._uniformData[i];

        uniformData[i] = {
            location: gl.getUniformLocation(webGLProgram, i),
            value: defaultValue(data.type, data.size),
        };
    }

    const glProgram = new GlProgramData(webGLProgram, uniformData);

    return glProgram;
}
