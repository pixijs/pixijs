import { MAX_TEXTURES } from '../../../batcher/shared/const';
import { UniformGroup } from '../../shared/shader/UniformGroup';

const sampleValues = new Int32Array(MAX_TEXTURES);

for (let i = 0; i < MAX_TEXTURES; i++)
{
    sampleValues[i] = i;
}

export const batchSamplersUniformGroup = new UniformGroup({
    uTextures: { value: sampleValues, type: `i32`, size: MAX_TEXTURES }
}, { isStatic: true });
