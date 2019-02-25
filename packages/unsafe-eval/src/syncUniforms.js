// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = location

/* eslint-disable max-len */
const GLSL_TO_SINGLE_SETTERS = {
    float(gl, location, cv, v)
    {
        if (cv !== v)
        {
            cv.v = v;
            gl.uniform1f(location, v);
        }
    },
    vec2(gl, location, cv, v)
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }
    },
    vec3(gl, location, cv, v)
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3f(location, v[0], v[1], v[2]);
        }
    },
    int(gl, location, cv, value) { gl.uniform1i(location, value); },
    ivec2(gl, location, cv, value) { gl.uniform2i(location, value[0], value[1]); },
    ivec3(gl, location, cv, value) { gl.uniform3i(location, value[0], value[1], value[2]); },
    ivec4(gl, location, cv, value) { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },

    bool(gl, location, cv, value) { gl.uniform1i(location, value); },
    bvec2(gl, location, cv, value) { gl.uniform2i(location, value[0], value[1]); },
    bvec3(gl, location, cv, value) { gl.uniform3i(location, value[0], value[1], value[2]); },
    bvec4(gl, location, cv, value) { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },

    mat2(gl, location, cv, value) { gl.uniformMatrix2fv(location, false, value); },
    mat3(gl, location, cv, value) { gl.uniformMatrix3fv(location, false, value); },
    mat4(gl, location, cv, value) { gl.uniformMatrix4fv(location, false, value); },

    sampler2D(gl, location, cv, value) { gl.uniform1i(location, value); },
    samplerCube(gl, location, cv, value) { gl.uniform1i(location, value); },
    sampler2DArray(gl, location, cv, value) { gl.uniform1i(location, value); },
};

const GLSL_TO_ARRAY_SETTERS = {
    float(gl, location, cv, value) { gl.uniform1fv(location, value); },
    vec2(gl, location, cv, value) { gl.uniform2fv(location, value); },
    vec3(gl, location, cv, value) { gl.uniform3fv(location, value); },
    vec4(gl, location, cv, value) { gl.uniform4fv(location, value); },
    int(gl, location, cv, value) { gl.uniform1iv(location, value); },
    ivec2(gl, location, cv, value) { gl.uniform2iv(location, value); },
    ivec3(gl, location, cv, value) { gl.uniform3iv(location, value); },
    ivec4(gl, location, cv, value) { gl.uniform4iv(location, value); },
    bool(gl, location, cv, value) { gl.uniform1iv(location, value); },
    bvec2(gl, location, cv, value) { gl.uniform2iv(location, value); },
    bvec3(gl, location, cv, value) { gl.uniform3iv(location, value); },
    bvec4(gl, location, cv, value) { gl.uniform4iv(location, value); },
    sampler2D(gl, location, cv, value) { gl.uniform1iv(location, value); },
    samplerCube(gl, location, cv, value) { gl.uniform1iv(location, value); },
    sampler2DArray(gl, location, cv, value) { gl.uniform1iv(location, value); },
};
/* eslint-disable max-len */

export function syncUniforms(group, uniformData, ud, uv, renderer)
{
    let textureCount = 0;
    let v = null;
    let cv = null;
    const gl = renderer.gl;

    for (const i in group.uniforms)
    {
        const data = uniformData[i];
        const uvi = uv[i];
        const udi = ud[i];
        const gu = group.uniforms[i];

        if (!data)
        {
            if (gu.group)
            {
                renderer.shader.syncUniformGroup(uvi);
            }

            continue;
        }

        if (data.type === 'float' && data.size === 1)
        {
            if (uvi !== udi.value)
            {
                udi.value = uvi;
                gl.uniform1f(udi.location, uvi);
            }
        }
        /* eslint-disable max-len */
        else if ((data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray') && data.size === 1 && !data.isArray)
        /* eslint-disable max-len */
        {
            renderer.texture.bind(uvi, textureCount);

            if (udi.value !== textureCount)
            {
                udi.value = textureCount;
                gl.uniform1i(udi.location, textureCount);
            }

            textureCount++;
        }
        else if (data.type === 'mat3' && data.size === 1)
        {
            if (gu.a !== undefined)
            {
                gl.uniformMatrix3fv(udi.location, false, uvi.toArray(true));
            }
            else
            {
                gl.uniformMatrix3fv(udi.location, false, uvi);
            }
        }
        else if (data.type === 'vec2' && data.size === 1)
        {
            if (gu.x !== undefined)
            {
                cv = udi.value;
                v = uvi;

                if (cv[0] !== v.x || cv[1] !== v.y)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    gl.uniform2f(udi.location, v.x, v.y);
                }
            }
            else
            {
                cv = udi.value;
                v = uvi;

                if (cv[0] !== v[0] || cv[1] !== v[1])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    gl.uniform2f(udi.location, v[0], v[1]);
                }
            }
        }
        else if (data.type === 'vec4' && data.size === 1)
        {
            if (gu.width !== undefined)
            {
                cv = udi.value;
                v = uvi;

                if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
                {
                    cv[0] = v.x;
                    cv[1] = v.y;
                    cv[2] = v.width;
                    cv[3] = v.height;
                    gl.uniform4f(udi.location, v.x, v.y, v.width, v.height);
                }
            }
            else
            {
                cv = udi.value;
                v = uvi;

                if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
                {
                    cv[0] = v[0];
                    cv[1] = v[1];
                    cv[2] = v[2];
                    cv[3] = v[3];

                    gl.uniform4f(udi.location, v[0], v[1], v[2], v[3]);
                }
            }
        }
        else
        {
            const funcArray = (data.size === 1) ? GLSL_TO_SINGLE_SETTERS : GLSL_TO_ARRAY_SETTERS;

            funcArray[data.type].call(null, gl, udi.location, udi.value, uvi);
        }
    }
}
