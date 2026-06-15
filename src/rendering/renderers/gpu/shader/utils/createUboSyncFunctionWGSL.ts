import { compileBufferSync } from '../../../shared/shader/utils/compileBufferSync';
import { uboSyncFunctionsWGSL } from '../../../shared/shader/utils/uboSyncFunctions';
import { generateArraySyncWGSL } from './generateArraySyncWGSL';

import type { UboElement, UniformsSyncCallback } from '../../../shared/shader/types';

/**
 * @param uboElements
 * @internal
 */
export function createUboSyncFunctionWGSL(
    uboElements: UboElement[],
): UniformsSyncCallback
{
    return compileBufferSync(
        uboElements,
        uboSyncFunctionsWGSL,
        generateArraySyncWGSL,
    );
}
