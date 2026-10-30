import { warn } from '../../../../../utils/logging/warn';
import { GlProgramData } from '../GlProgramData';
import { compileShader } from './compileShader';
import { defaultValue } from './defaultValue';
import { extractAttributesFromGlProgram } from './extractAttributesFromGlProgram';
import { getUboData } from './getUboData';
import { getUniformData } from './getUniformData';
import { logProgramError } from './logProgramError';

import type { GlRenderingContext } from '../../context/GlRenderingContext';
import type { GlProgram } from '../GlProgram';
import type { IGLUniformData } from '../GlProgramData';

/**
 * Matches a GLSL 1.00 attribute declaration, capturing its name. `in` counts too, as pixi's GLSL 1.00 vertex
 * shaders get `#define in attribute` (see addProgramDefines).
 */
const attributePattern = /^[ \t]*(?:attribute|in)[ \t]+(?:(?:lowp|mediump|highp)[ \t]+)?\w+[ \t]+(\w+)[ \t]*;/gm;

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

    // GLSL 1.00: bind attributes sorted by name in ascending order
    // GLSL 3.00: don't change the attribute locations that where chosen by the compiler
    //            or assigned by the layout specifier in the shader source code
    const sortAttributes = !(/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m).test(program.vertex);

    if (sortAttributes)
    {
        // bind the declared attributes before linking, so the program needn't be linked again once the active
        // ones are known. extractAttributesFromGlProgram checks the result and relinks if any were inactive.
        const names = [...new Set(Array.from(program.vertex.matchAll(attributePattern), (match) => match[1]))]
            .sort((a, b) => ((a > b) ? 1 : -1));

        for (let i = 0; i < names.length; i++)
        {
            gl.bindAttribLocation(webGLProgram, i, names[i]);
        }
    }

    gl.linkProgram(webGLProgram);

    if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS))
    {
        logProgramError(gl, webGLProgram, glVertShader, glFragShader);
    }

    program._attributeData = extractAttributesFromGlProgram(webGLProgram, gl, sortAttributes);

    program._uniformData = getUniformData(webGLProgram, gl);
    // each block reads from its own binding slot for the program's whole life, so two blocks can never
    // share one; transform feedback programs leave slot 0 free, as they always have
    program._uniformBlockData = getUboData(webGLProgram, gl, transformFeedbackVaryings ? 1 : 0);

    for (const name in program._uniformBlockData)
    {
        const { index, binding } = program._uniformBlockData[name];

        gl.uniformBlockBinding(webGLProgram, index, binding);
    }

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
