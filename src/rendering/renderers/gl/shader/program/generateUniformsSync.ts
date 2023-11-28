// cu = Cached value's uniform data field
// cv = Cached value
// v = value to upload
// ud = uniformData
// uv = uniformValue

import { BufferResource } from '../../../shared/buffer/BufferResource';
import { UniformGroup } from '../../../shared/shader/UniformGroup';
import { GLSL_TO_ARRAY_SETTERS, GLSL_TO_SINGLE_SETTERS_CACHED } from './generateUniformsSyncTypes';
import { uniformParsers } from './uniformParsers';

import type { UniformsSyncCallback } from '../../../shared/shader/utils/createUniformBufferSyncTypes';
import type { GLSL_TYPE } from './generateUniformsSyncTypes';

export function generateUniformsSync(group: UniformGroup, uniformData: Record<string, any>): UniformsSyncCallback
{
    const funcFragments = [`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
        var name = null;
    `];

    for (const i in group.uniforms)
    {
        const data = uniformData[i];

        if (!data)
        {
            if (group.uniforms[i] instanceof UniformGroup)
            {
                if ((group.uniforms[i] as UniformGroup).ubo)
                {
                    funcFragments.push(`
                        renderer.shader.bindUniformBlock(uv.${i}, "${i}");
                    `);
                }
                else
                {
                    funcFragments.push(`
                        renderer.shader.updateUniformGroup(uv.${i});
                    `);
                }
            }
            else if (group.uniforms[i] instanceof BufferResource)
            {
                funcFragments.push(`
                        renderer.shader.bindBufferResource(uv.${i}, "${i}");
                    `);
            }

            continue;
        }

        const uniform = group.uniforms[i];

        let parsed = false;

        for (let j = 0; j < uniformParsers.length; j++)
        {
            if (uniformParsers[j].test(data, uniform))
            {
                funcFragments.push(`name = "${i}";`, uniformParsers[j].code);
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            const templateType = data.size === 1 && !data.isArray ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;
            const template = templateType[data.type as GLSL_TYPE].replace('location', `ud["${i}"].location`);

            funcFragments.push(`
            cu = ud["${i}"];
            cv = cu.value;
            v = uv["${i}"];
            ${template};`);
        }
    }

    /*
     * the introduction of syncData is to solve an issue where textures in uniform groups are not set correctly
     * the texture count was always starting from 0 in each group. This needs to increment each time a texture is used
     * no matter which group is being used
     *
     */
    // eslint-disable-next-line no-new-func
    return new Function('ud', 'uv', 'renderer', 'syncData', funcFragments.join('\n')) as UniformsSyncCallback;
}
