import { MAX_TEXTURES } from '../../../batcher/shared/const';
import { UniformGroup } from '../../shared/shader/UniformGroup';

import type { UNIFORM_TYPES } from '../../shared/shader/utils/createUBOElements';

const sampleValues = new Int32Array(MAX_TEXTURES);

for (let i = 0; i < MAX_TEXTURES; i++)
{
    sampleValues[i] = i;
}

export const batchSamplersUniformGroup = new UniformGroup({
    uSamplers: { value: sampleValues, type: `array<u32,${MAX_TEXTURES}>` as UNIFORM_TYPES }
}, { isStatic: true });
