/* eslint-disable quote-props */
import { generateUniformBufferSync } from '../../../shared/shader/utils/createUniformBufferSync';
import { uniformBufferSyncFunctionsWGSL } from '../../../shared/shader/utils/uniformBufferSyncFunctions';
import { generateArraySyncWGSL } from './generateArraySyncWGSL';

import type { UBOElement, UniformsSyncCallback } from '../../../shared/shader/types';

export function generateUniformBufferSyncWGSL(
    uboElements: UBOElement[],
): UniformsSyncCallback
{
    return generateUniformBufferSync(
        uboElements,
        'uboWgsl',
        generateArraySyncWGSL,
        uniformBufferSyncFunctionsWGSL,
    );
}
