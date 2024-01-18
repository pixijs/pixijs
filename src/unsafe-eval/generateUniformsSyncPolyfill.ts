import { uniformParsers } from '../rendering/renderers/shared/shader/utils/uniformParsers';
import { UNIFORM_TO_ARRAY_FUNCTIONS, UNIFORM_TO_SINGLE_FUNCTIONS, uniformParsersFunctions } from './uniformSyncFunctions';

import type { GlUniformData } from '../rendering/renderers/gl/shader/GlProgram';
import type { WebGLRenderer } from '../rendering/renderers/gl/WebGLRenderer';
import type { UniformsSyncCallback } from '../rendering/renderers/shared/shader/types';
import type { UniformGroup } from '../rendering/renderers/shared/shader/UniformGroup';
import type { UniformUploadFunction } from './uniformSyncFunctions';

export function generateUniformsSyncPolyfill(
    group: UniformGroup,
    uniformData: Record<string, GlUniformData>
): UniformsSyncCallback
{
    // loop through all the uniforms..
    const functionMap: Record<string, UniformUploadFunction> = {};

    for (const i in group.uniformStructures)
    {
        if (!uniformData[i]) continue;

        const uniform = group.uniformStructures[i];

        let parsed = false;

        for (let j = 0; j < uniformParsers.length; j++)
        {
            const parser = uniformParsers[j];

            if (uniform.type === parser.type && parser.test(uniform))
            {
                functionMap[i] = uniformParsersFunctions[j];

                parsed = true;

                break;
            }
        }

        // if not parsed...

        if (!parsed)
        {
            const templateType = uniform.size === 1 ? UNIFORM_TO_SINGLE_FUNCTIONS : UNIFORM_TO_ARRAY_FUNCTIONS;

            functionMap[i] = templateType[uniform.type];
        }
    }

    return (
        ud: Record<string, any>,
        uv: Record<string, any>,
        renderer: WebGLRenderer) =>
    {
        const gl = renderer.gl;

        for (const i in functionMap)
        {
            const v = group.uniforms[i];
            const cu = ud[i];
            const cv = ud[i].value;

            functionMap[i](i, cu, cv, v, ud, uv, gl);
        }
    };
}
