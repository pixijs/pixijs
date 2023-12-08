import { type UBOElement, WGSL_TO_STD40_SIZE } from '../rendering/renderers/shared/shader/utils/createUBOElements';
import { UBO_TO_SINGLE_SETTERS_FN } from '../rendering/renderers/shared/shader/utils/createUniformBufferSyncTypes';
import { uniformBufferParsers } from '../rendering/renderers/shared/shader/utils/uniformBufferParsers';

import type {
    UBO_TYPE,
    UniformsSyncCallback
} from '../rendering/renderers/shared/shader/utils/createUniformBufferSyncTypes';

export function generateUniformBufferSyncPolyfill(
    uboElements: UBOElement[],
): UniformsSyncCallback
{
    return ((uv: any, data: any, o: any) =>
    {
        let v = null;
        let t = 0;

        let prev = 0;

        for (let i = 0; i < uboElements.length; i++)
        {
            const uboElement = uboElements[i];

            const name = uboElement.data.name;

            let executed = false;
            let offset = 0;

            for (let j = 0; j < uniformBufferParsers.length; j++)
            {
                const uniformParser = uniformBufferParsers[j];

                if (uniformParser.test(uboElement.data))
                {
                    offset = uboElement.offset / 4;

                    o += offset - prev;

                    uniformBufferParsers[j].exec(name, uv, data, o, v);

                    executed = true;

                    break;
                }
            }

            if (!executed)
            {
                if (uboElement.data.size > 1)
                {
                    const rowSize = Math.max(WGSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1);
                    const elementSize = (uboElement.data.value as Array<number>).length / uboElement.data.size;

                    const remainder = (4 - (elementSize % 4)) % 4;

                    offset = uboElement.offset / 4;

                    v = uv[name];
                    o += offset - prev;

                    let arrayOffset = o;

                    t = 0;

                    for (let i = 0; i < uboElement.data.size * rowSize; i++)
                    {
                        for (let j = 0; j < elementSize; j++)
                        {
                            data[arrayOffset++] = v[t++];
                        }
                        if (remainder !== 0)
                        {
                            arrayOffset += remainder;
                        }
                    }
                }
                else
                {
                    const template = UBO_TO_SINGLE_SETTERS_FN[uboElement.data.type as UBO_TYPE];

                    offset = uboElement.offset / 4;

                    v = uv[name];
                    o += offset - prev;
                    template(data, o, v);
                }
            }

            prev = offset;
        }
    }) as UniformsSyncCallback;
}
