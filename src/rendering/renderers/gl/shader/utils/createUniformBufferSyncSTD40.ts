/* eslint-disable quote-props */

import { generateUniformBufferSync } from '../../../shared/shader/utils/createUniformBufferSync';
import { uniformBufferSyncFunctionsSTD40 } from '../../../shared/shader/utils/uniformBufferSyncFunctions';
import { generateArraySyncSTD40 } from './generateArraySyncSTD40';

import type { UBOElement, UniformsSyncCallback } from '../../../shared/shader/types';

export function generateUniformBufferSyncSTD40(
    uboElements: UBOElement[],
): UniformsSyncCallback
{
    return generateUniformBufferSync(
        uboElements,
        'uboStd40',
        generateArraySyncSTD40,
        uniformBufferSyncFunctionsSTD40,
    );
}
