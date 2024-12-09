import { createUboSyncFunction } from '../../../shared/shader/utils/createUboSyncFunction';
import { uboSyncFunctionsWGSL } from '../../../shared/shader/utils/uboSyncFunctions';
import { generateArraySyncWGSL } from './generateArraySyncWGSL';

import type { UboElement, UniformsSyncCallback } from '../../../shared/shader/types';

export function createUboSyncFunctionWGSL(
    uboElements: UboElement[],
): UniformsSyncCallback
{
    return createUboSyncFunction(
        uboElements,
        'uboWgsl',
        generateArraySyncWGSL,
        uboSyncFunctionsWGSL,
    );
}
