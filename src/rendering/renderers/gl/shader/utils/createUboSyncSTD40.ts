import { createUboSyncFunction } from '../../../shared/shader/utils/createUboSyncFunction';
import { uboSyncFunctionsSTD40 } from '../../../shared/shader/utils/uboSyncFunctions';
import { generateArraySyncSTD40 } from './generateArraySyncSTD40';

import type { UboElement, UniformsSyncCallback } from '../../../shared/shader/types';

export function createUboSyncFunctionSTD40(
    uboElements: UboElement[],
): UniformsSyncCallback
{
    return createUboSyncFunction(
        uboElements,
        'uboStd40',
        generateArraySyncSTD40,
        uboSyncFunctionsSTD40,
    );
}
