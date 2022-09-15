import { uniformParsers } from './uniformParsers';

import type { UniformGroup } from '../UniformGroup';
import type { Dict } from '@pixi/utils';

export type UniformsSyncCallback = (...args: any[]) => void;

// cu = Cached value's uniform data field
// cv = Cached value
// v = value to upload
// ud = uniformData
// uv = uniformValue
// l = location
const GLSL_TO_SINGLE_SETTERS_CACHED: Dict<string> = {

    float: `
    if (cv !== v)
    {
        cu.value = v;
        gl.uniform1f(location, v);
    }`,

    vec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2f(location, v[0], v[1])
    }`,

    vec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3f(location, v[0], v[1], v[2])
    }`,

    vec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4f(location, v[0], v[1], v[2], v[3]);
    }`,

    int: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
    ivec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2i(location, v[0], v[1]);
    }`,
    ivec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3i(location, v[0], v[1], v[2]);
    }`,
    ivec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4i(location, v[0], v[1], v[2], v[3]);
    }`,

    uint: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1ui(location, v);
    }`,
    uvec2: `
    if (cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2ui(location, v[0], v[1]);
    }`,
    uvec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3ui(location, v[0], v[1], v[2]);
    }`,
    uvec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
    }`,

    bool: `
    if (cv !== v)
    {
        cu.value = v;
        gl.uniform1i(location, v);
    }`,
    bvec2: `
    if (cv[0] != v[0] || cv[1] != v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];

        gl.uniform2i(location, v[0], v[1]);
    }`,
    bvec3: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3i(location, v[0], v[1], v[2]);
    }`,
    bvec4: `
    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];
        cv[3] = v[3];

        gl.uniform4i(location, v[0], v[1], v[2], v[3]);
    }`,

    mat2:     'gl.uniformMatrix2fv(location, false, v)',
    mat3:     'gl.uniformMatrix3fv(location, false, v)',
    mat4:     'gl.uniformMatrix4fv(location, false, v)',

    sampler2D: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
    samplerCube: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
    sampler2DArray: `
    if (cv !== v)
    {
        cu.value = v;

        gl.uniform1i(location, v);
    }`,
};

const GLSL_TO_ARRAY_SETTERS: Dict<string> = {

    float:    `gl.uniform1fv(location, v)`,

    vec2:     `gl.uniform2fv(location, v)`,
    vec3:     `gl.uniform3fv(location, v)`,
    vec4:     'gl.uniform4fv(location, v)',

    mat4:     'gl.uniformMatrix4fv(location, false, v)',
    mat3:     'gl.uniformMatrix3fv(location, false, v)',
    mat2:     'gl.uniformMatrix2fv(location, false, v)',

    int:      'gl.uniform1iv(location, v)',
    ivec2:    'gl.uniform2iv(location, v)',
    ivec3:    'gl.uniform3iv(location, v)',
    ivec4:    'gl.uniform4iv(location, v)',

    uint:     'gl.uniform1uiv(location, v)',
    uvec2:    'gl.uniform2uiv(location, v)',
    uvec3:    'gl.uniform3uiv(location, v)',
    uvec4:    'gl.uniform4uiv(location, v)',

    bool:     'gl.uniform1iv(location, v)',
    bvec2:    'gl.uniform2iv(location, v)',
    bvec3:    'gl.uniform3iv(location, v)',
    bvec4:    'gl.uniform4iv(location, v)',

    sampler2D:      'gl.uniform1iv(location, v)',
    samplerCube:    'gl.uniform1iv(location, v)',
    sampler2DArray: 'gl.uniform1iv(location, v)',
};

export function generateUniformsSync(group: UniformGroup, uniformData: Dict<any>): UniformsSyncCallback
{
    const funcFragments = [`
        var v = null;
        var cv = null;
        var cu = null;
        var t = 0;
        var gl = renderer.gl;
    `];

    for (const i in group.uniforms)
    {
        const data = uniformData[i];

        if (!data)
        {
            if (group.uniforms[i]?.group)
            {
                if (group.uniforms[i].ubo)
                {
                    funcFragments.push(`
                        renderer.shader.syncUniformBufferGroup(uv.${i}, '${i}');
                    `);
                }
                else
                {
                    funcFragments.push(`
                        renderer.shader.syncUniformGroup(uv.${i}, syncData);
                    `);
                }
            }

            continue;
        }

        const uniform = group.uniforms[i];

        let parsed = false;

        for (let j = 0; j < uniformParsers.length; j++)
        {
            if (uniformParsers[j].test(data, uniform))
            {
                funcFragments.push(uniformParsers[j].code(i, uniform));
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            const templateType = data.size === 1 && !data.isArray ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;
            const template = templateType[data.type].replace('location', `ud["${i}"].location`);

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
