import {
    GLSL_TO_ARRAY_SETTERS_FN,
    GLSL_TO_SINGLE_SETTERS_FN_CACHED
} from '../rendering/renderers/gl/shader/program/generateUniformsSyncTypes';
import { uniformParsers } from '../rendering/renderers/gl/shader/program/uniformParsers';
import { BufferResource } from '../rendering/renderers/shared/buffer/BufferResource';
import { UniformGroup } from '../rendering/renderers/shared/shader/UniformGroup';

import type { GlUniformData } from '../rendering/renderers/gl/shader/GlProgram';
import type { GLSL_TYPE } from '../rendering/renderers/gl/shader/program/generateUniformsSyncTypes';
import type { UniformsSyncCallback } from '../rendering/renderers/shared/shader/utils/createUniformBufferSyncTypes';

export function generateUniformsSyncPolyfill(
    group: UniformGroup,
    uniformData: Record<string, GlUniformData>
): UniformsSyncCallback
{
    return ((ud: any, uv: any, renderer: any, syncData: any) =>
    {
        let v = null;
        let cv = null;
        let cu = null;
        const t = 0;
        const gl = renderer.gl;

        for (const i in group.uniforms)
        {
            const data = uniformData[i];

            if (!data)
            {
                if (group.uniforms[i] instanceof UniformGroup)
                {
                    if ((group.uniforms[i] as UniformGroup).ubo)
                    {
                        renderer.shader.bindUniformBlock(uv[i], i);
                    }
                    else
                    {
                        renderer.shader.updateUniformGroup(uv[i]);
                    }
                }
                else if (group.uniforms[i] instanceof BufferResource)
                {
                    renderer.shader.bindBufferResource(uv[i], i);
                }

                continue;
            }

            const uniform = group.uniforms[i];

            let executed = false;

            for (let j = 0; j < uniformParsers.length; j++)
            {
                if (uniformParsers[j].test(data, uniform))
                {
                    uniformParsers[j].exec(i, cv, ud, uv, v, t, gl, renderer, syncData);
                    executed = true;

                    break;
                }
            }

            if (!executed)
            {
                cu = ud[i];
                cv = cu.value;
                v = uv[i];

                const isSingleSetter = data.size === 1 && !data.isArray;

                if (isSingleSetter)
                {
                    GLSL_TO_SINGLE_SETTERS_FN_CACHED[data.type as GLSL_TYPE](cu, cv, v, ud[i].location, gl);
                }
                else
                {
                    GLSL_TO_ARRAY_SETTERS_FN[data.type as GLSL_TYPE](v, ud[i].location, gl);
                }

                cu = ud[i];
                cv = cu.value;
                v = uv[i];
            }
        }
    }) as UniformsSyncCallback;
}

