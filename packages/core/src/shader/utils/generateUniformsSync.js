// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = location
const GLSL_TO_SINGLE_SETTERS_CACHED = {

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

const GLSL_TO_ARRAY_SETTERS = {

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

// Parsers, each one of these will take a look at the type of shader property and uniform.
// if they pass the test function then the glsl function is called that returns a the shader upload code for that uniform.
// Shader upload code is automagically generated with these parsers.
// If no parser is valid then the default upload functions are used.
// exposing Parsers means that custom upload logic can be added to pixi's shaders.
// A good example would be a pixi rectangle can be directly set on a uniform.
// If the shader sees it it knows how to upload the rectangle structure as a vec4
// format is as follows:
//
// {
//     test: (data, uniform) => {} <--- test is this glsl should be used for this uniform
//     glsl: (name, uniform) => {} <--- returns the string of the piece of code that uploads the uniform
// }
export const PARSERS = [

    // a float cache layer
    {
        test: (data) =>
            data.type === 'float' && data.size === 1,
        glsl: (name) =>
            `
            if(uv.${name} !== ud.${name}.value)
            {
                ud.${name}.value = uv.${name}
                gl.uniform1f(ud.${name}.location, uv.${name})
            }
            `,
    },
    // handling samplers
    {
        test: (data) =>
            // eslint-disable-next-line max-len
            (data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray,
        glsl: (name) => `t = syncData.textureCount++;

            renderer.texture.bind(uv.${name}, t);
            
            if(ud.${name}.value !== t)
            {
                ud.${name}.value = t;
                gl.uniform1i(ud.${name}.location, t);\n; // eslint-disable-line max-len
            }`,
    },
    // uploading pixi matrix object to mat3
    {
        test: (data, uniform) =>
            data.type === 'mat3' && data.size === 1 && uniform.a !== undefined,
        glsl: (name) =>

            // TODO and some smart caching dirty ids here!
            `
            gl.uniformMatrix3fv(ud.${name}.location, false, uv.${name}.toArray(true));
            `
        ,

    },
    // uploading a pixi point as a vec2 with caching layer
    {
        test: (data, uniform) =>
            data.type === 'vec2' && data.size === 1 && uniform.x !== undefined,
        glsl: (name) =>
            `
                cv = ud.${name}.value;
                v = uv.${name};

                if(cv[0] !== v.x || cv[1] !== v.y)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(ud.${name}.location, v.x, v.y);
                }`,
    },
    // caching layer for a vec2
    {
        test: (data) =>
            data.type === 'vec2' && data.size === 1,
        glsl: (name) =>
            `
                cv = ud.${name}.value;
                v = uv.${name};

                if(cv[0] !== v[0] || cv[1] !== v[1])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(ud.${name}.location, v[0], v[1]);
                }
            `,
    },
    // upload a pixi rectangle as a vec4 with caching layer
    {
        test: (data, uniform) =>
            data.type === 'vec4' && data.size === 1 && uniform.width !== undefined,

        glsl: (name) =>
            `
                cv = ud.${name}.value;
                v = uv.${name};

                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(ud.${name}.location, v.x, v.y, v.width, v.height)
                }`,
    },
    // a caching layer for vec4 uploading
    {
        test: (data) =>
            data.type === 'vec4' && data.size === 1,
        glsl: (name) =>
            `
                cv = ud.${name}.value;
                v = uv.${name};

                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];

                    gl.uniform4f(ud.${name}.location, v[0], v[1], v[2], v[3])
                }`,
    },
];

export function generateUniformsSync(group, uniformData)
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
                    renderer.shader.syncUniformGroup(uv.${i}, syncData);
                `);
            }

            continue;
        }

        const uniform = group.uniforms[i];

        let parsed = false;

        for (let j = 0; j < PARSERS.length; j++)
        {
            if (PARSERS[j].test(data, uniform))
            {
                funcFragments.push(PARSERS[j].glsl(i, uniform));
                parsed = true;

                break;
            }
        }

        if (!parsed)
        {
            const templateType = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;

            const template =  templateType[data.type].replace('location', `ud.${i}.location`);

            funcFragments.push(`
            cv = ud.${i}.value;
            v = uv.${i};
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
