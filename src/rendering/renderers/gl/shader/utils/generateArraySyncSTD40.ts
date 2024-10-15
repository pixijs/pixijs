import { WGSL_TO_STD40_SIZE } from './createUboElementsSTD40';

import type { UboElement } from '../../../shared/shader/types';

/**
 * This generates a function that will sync an array to the uniform buffer
 * following the std140 layout
 * @param uboElement - the element to generate the array sync for
 * @param offsetToAdd - the offset to append at the start of the code
 * @returns - the generated code
 */
export function generateArraySyncSTD40(uboElement: UboElement, offsetToAdd: number): string
{
    const rowSize = Math.max(WGSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1);
    const elementSize = (uboElement.data.value as Array<number>).length / uboElement.data.size;// size / rowSize;

    const remainder = (4 - (elementSize % 4)) % 4;
    const data = uboElement.data.type.indexOf('i32') >= 0 ? 'dataInt32' : 'data';

    return `
        v = uv.${uboElement.data.name};
        offset += ${offsetToAdd};

        arrayOffset = offset;

        t = 0;

        for(var i=0; i < ${uboElement.data.size * rowSize}; i++)
        {
            for(var j = 0; j < ${elementSize}; j++)
            {
                ${data}[arrayOffset++] = v[t++];
            }
            ${remainder !== 0 ? `arrayOffset += ${remainder};` : ''}
        }
    `;
}
