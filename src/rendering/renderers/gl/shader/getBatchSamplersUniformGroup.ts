import { UniformGroup } from '../../shared/shader/UniformGroup';

const batchSamplersUniformGroupHash: Record<number, UniformGroup> = {};

/**
 * Automatically generates a uniform group that holds the texture samplers for a shader.
 * This is used mainly by the shaders that batch textures!
 * @param maxTextures - the number of textures that this uniform group will contain.
 * @returns a uniform group that holds the texture samplers.
 */
export function getBatchSamplersUniformGroup(maxTextures: number)
{
    let batchSamplersUniformGroup = batchSamplersUniformGroupHash[maxTextures];

    if (batchSamplersUniformGroup) return batchSamplersUniformGroup;

    const sampleValues = new Int32Array(maxTextures);

    for (let i = 0; i < maxTextures; i++)
    {
        sampleValues[i] = i;
    }

    batchSamplersUniformGroup = batchSamplersUniformGroupHash[maxTextures] = new UniformGroup({
        uTextures: { value: sampleValues, type: `i32`, size: maxTextures }
    }, { isStatic: true });

    return batchSamplersUniformGroup;
}
