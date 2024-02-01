import type { GlUniformBlockData } from '../GlProgram';

/**
 * returns the uniform block data from the program
 * @private
 * @param program - the webgl program
 * @param gl - the WebGL context
 * @returns {object} the uniform data for this program
 */
export function getUboData(program: WebGLProgram, gl: WebGL2RenderingContext): Record<string, GlUniformBlockData>
{
    // if uniform buffer data is not supported, early out
    if (!gl.ACTIVE_UNIFORM_BLOCKS) return {};

    const uniformBlocks: Record<string, GlUniformBlockData> = {};

    // const totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    const totalUniformsBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);

    for (let i = 0; i < totalUniformsBlocks; i++)
    {
        const name = gl.getActiveUniformBlockName(program, i);
        const uniformBlockIndex = gl.getUniformBlockIndex(program, name);

        const size = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_DATA_SIZE);

        uniformBlocks[name] = {
            name,
            index: uniformBlockIndex,
            size,
        };
    }

    return uniformBlocks;
}
