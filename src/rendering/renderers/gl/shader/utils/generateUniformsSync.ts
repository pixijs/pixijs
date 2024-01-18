// cu = Cached value's uniform data field
// cv = Cached value
// v = value to upload
// ud = uniformData
// uv = uniformValue

import { BufferResource } from '../../../shared/buffer/BufferResource';
import { UniformGroup } from '../../../shared/shader/UniformGroup';
import { uniformParsers } from '../../../shared/shader/utils/uniformParsers';
import { UNIFORM_TO_ARRAY_SETTERS, UNIFORM_TO_SINGLE_SETTERS } from './generateUniformsSyncTypes';

import type { UniformsSyncCallback } from '../../../shared/shader/types';

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
        if (!uniformData[i])
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

        const uniform = group.uniformStructures[i];

        let parsed = false;

        for (let j = 0; j < uniformParsers.length; j++)
        {
            const parser = uniformParsers[j];

            if (uniform.type === parser.type && parser.test(uniform))
            {
                funcFragments.push(`name = "${i}";`, uniformParsers[j].uniform);
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            const templateType = uniform.size === 1 ? UNIFORM_TO_SINGLE_SETTERS : UNIFORM_TO_ARRAY_SETTERS;

            const template = templateType[uniform.type].replace('location', `ud["${i}"].location`);

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
