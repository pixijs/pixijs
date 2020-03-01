import { uniformParsers } from './uniformParsers';

import type { UniformGroup } from '../UniformGroup';

// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = location
const GLSL_TO_SINGLE_SETTERS_CACHED: {[x: string]: string} = {

    float: `
    if(cv !== v)
    {
        cv.v = v;
        gl.uniform1f(location, v)
    }`,

    vec2: `
    if(cv[0] !== v[0] || cv[1] !== v[1])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        gl.uniform2f(location, v[0], v[1])
    }`,

    vec3: `
    if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
    {
        cv[0] = v[0];
        cv[1] = v[1];
        cv[2] = v[2];

        gl.uniform3f(location, v[0], v[1], v[2])
    }`,

    vec4:     'gl.uniform4f(location, v[0], v[1], v[2], v[3])',

    int:      'gl.uniform1i(location, v)',
    ivec2:    'gl.uniform2i(location, v[0], v[1])',
    ivec3:    'gl.uniform3i(location, v[0], v[1], v[2])',
    ivec4:    'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

    bool:     'gl.uniform1i(location, v)',
    bvec2:    'gl.uniform2i(location, v[0], v[1])',
    bvec3:    'gl.uniform3i(location, v[0], v[1], v[2])',
    bvec4:    'gl.uniform4i(location, v[0], v[1], v[2], v[3])',

    mat2:     'gl.uniformMatrix2fv(location, false, v)',
    mat3:     'gl.uniformMatrix3fv(location, false, v)',
    mat4:     'gl.uniformMatrix4fv(location, false, v)',

    sampler2D:      'gl.uniform1i(location, v)',
    samplerCube:    'gl.uniform1i(location, v)',
    sampler2DArray: 'gl.uniform1i(location, v)',
};

const GLSL_TO_ARRAY_SETTERS: {[x: string]: string} = {

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

    bool:     'gl.uniform1iv(location, v)',
    bvec2:    'gl.uniform2iv(location, v)',
    bvec3:    'gl.uniform3iv(location, v)',
    bvec4:    'gl.uniform4iv(location, v)',

    sampler2D:      'gl.uniform1iv(location, v)',
    samplerCube:    'gl.uniform1iv(location, v)',
    sampler2DArray: 'gl.uniform1iv(location, v)',
};

export function generateUniformsSync(group: UniformGroup, uniformData: {[x: string]: any}): Function
{
    const funcFragments = [`
        var v = null;
        var cv = null
        var t = 0;
        var gl = renderer.gl
    `];

    for (const i in group.uniforms)
    {
        const data = uniformData[i];

        if (!data)
        {
            if (group.uniforms[i].group)
            {
                funcFragments.push(`
                    renderer.shader.syncUniformGroup(uv["${i}"], syncData);
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
                funcFragments.push(uniformParsers[j].code(i, uniform));
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            const templateType = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;

            const template =  templateType[data.type].replace('location', `ud["${i}"].location`);

            funcFragments.push(`
            cv = ud["${i}"].value;
            v = uv["${i}"];
            ${template};`);
        }
    }

    /**
     * the introduction of syncData is to solve an issue where textures in uniform groups are not set correctly
     * the texture count was always starting from 0 in each group. This needs to increment each time a texture is used
     * no matter which group is being used
     *
     */
    return new Function('ud', 'uv', 'renderer', 'syncData', funcFragments.join('\n')); // eslint-disable-line no-new-func
}

