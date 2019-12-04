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

export function generateUniformsSync(group, uniformData)
{
    let func = `var v = null;
    var cv = null
    var t = 0;
    var gl = renderer.gl
    `;

    for (const i in group.uniforms)
    {
        const data = uniformData[i];

        if (!data)
        {
            if (group.uniforms[i].group)
            {
                func += `
                    renderer.shader.syncUniformGroup(uv.${i}, syncData);
                `;
            }

            continue;
        }

        // TODO && uniformData[i].value !== 0 <-- do we still need this?
        if (data.type === 'float' && data.size === 1)
        {
            func += `
            if(uv.${i} !== ud.${i}.value)
            {
                ud.${i}.value = uv.${i}
                gl.uniform1f(ud.${i}.location, uv.${i})
            }\n`;
        }
        /* eslint-disable max-len */
        else if ((data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray)
        /* eslint-disable max-len */
        {
            func += `

            t = syncData.textureCount++;

            renderer.texture.bind(uv.${i}, t);
            
            if(ud.${i}.value !== t)
            {
                ud.${i}.value = t;
                gl.uniform1i(ud.${i}.location, t);\n; // eslint-disable-line max-len
            }\n`;
        }
        else if (data.type === 'mat3' && data.size === 1)
        {
            if (group.uniforms[i].a !== undefined)
            {
                // TODO and some smart caching dirty ids here!
                func += `
                gl.uniformMatrix3fv(ud.${i}.location, false, uv.${i}.toArray(true));
                \n`;
            }
            else
            {
                func += `
                gl.uniformMatrix3fv(ud.${i}.location, false, uv.${i});
                \n`;
            }
        }
        else if (data.type === 'vec2' && data.size === 1)
        {
            // TODO - do we need both here?
            // maybe we can get away with only using points?
            if (group.uniforms[i].x !== undefined)
            {
                func += `
                cv = ud.${i}.value;
                v = uv.${i};

                if(cv[0] !== v.x || cv[1] !== v.y)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(ud.${i}.location, v.x, v.y);
                }\n`;
            }
            else
            {
                func += `
                cv = ud.${i}.value;
                v = uv.${i};

                if(cv[0] !== v[0] || cv[1] !== v[1])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(ud.${i}.location, v[0], v[1]);
                }
                \n`;
            }
        }
        else if (data.type === 'vec4' && data.size === 1)
        {
            // TODO - do we need both here?
            // maybe we can get away with only using points?
            if (group.uniforms[i].width !== undefined)
            {
                func += `
                cv = ud.${i}.value;
                v = uv.${i};

                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(ud.${i}.location, v.x, v.y, v.width, v.height)
                }\n`;
            }
            else
            {
                func += `
                cv = ud.${i}.value;
                v = uv.${i};

                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];

                    gl.uniform4f(ud.${i}.location, v[0], v[1], v[2], v[3])
                }
                \n`;
            }
        }
        else
        {
            const templateType = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;

            const template =  templateType[data.type].replace('location', `ud.${i}.location`);

            func += `
            cv = ud.${i}.value;
            v = uv.${i};
            ${template};\n`;
        }
    }

    /**
     * the introduction of syncData is to solve an issue where textures in uniform groups are not set correctly
     * the texture count was always starting from 0 in each group. This needs to increment each time a texture is used
     * no matter which group is being used
     *
     */
    return new Function('ud', 'uv', 'renderer', 'syncData', func); // eslint-disable-line no-new-func
}
