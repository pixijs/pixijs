import { getTestContext } from '../../../renderers/gl/shader/program/getTestContext';
import { checkMaxIfStatementsInShader } from './checkMaxIfStatementsInShader';

let maxTexturesPerBatchCache: number | null = null;

/**
 * Returns the maximum number of textures that can be batched. This uses WebGL1's `MAX_TEXTURE_IMAGE_UNITS`.
 * The response for this is that to get this info via WebGPU, we would need to make a context, which
 * would make this function async, and we want to avoid that.
 * @private
 * @returns {number} The maximum number of textures that can be batched
 */
export function getMaxTexturesPerBatch(): number
{
    if (maxTexturesPerBatchCache) return maxTexturesPerBatchCache;

    const gl = getTestContext();

    // step 1: first check max textures the GPU can handle.
    maxTexturesPerBatchCache = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    // step 2: check the maximum number of if statements the shader can have too..
    maxTexturesPerBatchCache = checkMaxIfStatementsInShader(
        maxTexturesPerBatchCache, gl);

    return maxTexturesPerBatchCache;
}
