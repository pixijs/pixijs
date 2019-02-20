// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = location

/* eslint-disable max-len */
const GLSL_TO_SINGLE_SETTERS = {
    float: function setSingleFloat(gl, location, cv, v)
    {
        if (cv !== v)
        {
            cv.v = v;
            gl.uniform1f(location, v);
        }
    },
    vec2: function setSingleVec2(gl, location, cv, v)
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }
    },
    vec3: function setSingleVec3(gl, location, cv, v)
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3f(location, v[0], v[1], v[2]);
        }
    },
    int: function setSingleInt(gl, location, cv, value) { gl.uniform1i(location, value); },
    ivec2: function setSingleIvec2(gl, location, cv, value) { gl.uniform2i(location, value[0], value[1]); },
    ivec3: function setSingleIvec3(gl, location, cv, value) { gl.uniform3i(location, value[0], value[1], value[2]); },
    ivec4: function setSingleIvec4(gl, location, cv, value) { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },

    bool: function setSingleBool(gl, location, cv, value) { gl.uniform1i(location, value); },
    bvec2: function setSingleBvec2(gl, location, cv, value) { gl.uniform2i(location, value[0], value[1]); },
    bvec3: function setSingleBvec3(gl, location, cv, value) { gl.uniform3i(location, value[0], value[1], value[2]); },
    bvec4: function setSingleBvec4(gl, location, cv, value) { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },

    mat2: function setSingleMat2(gl, location, cv, value) { gl.uniformMatrix2fv(location, false, value); },
    mat3: function setSingleMat3(gl, location, cv, value) { gl.uniformMatrix3fv(location, false, value); },
    mat4: function setSingleMat4(gl, location, cv, value) { gl.uniformMatrix4fv(location, false, value); },

    sampler2D: function setSingleSampler2D(gl, location, cv, value) { gl.uniform1i(location, value); },
    samplerCube: function setSingleSampler2D(gl, location, cv, value) { gl.uniform1i(location, value); },
    sampler2DArray: function setSingleSampler2D(gl, location, cv, value) { gl.uniform1i(location, value); },
};

const GLSL_TO_ARRAY_SETTERS = {
    float: function setFloatArray(gl, location, cv, value) { gl.uniform1fv(location, value); },
    vec2: function setVec2Array(gl, location, cv, value) { gl.uniform2fv(location, value); },
    vec3: function setVec3Array(gl, location, cv, value) { gl.uniform3fv(location, value); },
    vec4: function setVec4Array(gl, location, cv, value) { gl.uniform4fv(location, value); },
    int: function setIntArray(gl, location, cv, value) { gl.uniform1iv(location, value); },
    ivec2: function setIvec2Array(gl, location, cv, value) { gl.uniform2iv(location, value); },
    ivec3: function setIvec3Array(gl, location, cv, value) { gl.uniform3iv(location, value); },
    ivec4: function setIvec4Array(gl, location, cv, value) { gl.uniform4iv(location, value); },
    bool: function setBoolArray(gl, location, cv, value) { gl.uniform1iv(location, value); },
    bvec2: function setBvec2Array(gl, location, cv, value) { gl.uniform2iv(location, value); },
    bvec3: function setBvec3Array(gl, location, cv, value) { gl.uniform3iv(location, value); },
    bvec4: function setBvec4Array(gl, location, cv, value) { gl.uniform4iv(location, value); },
    sampler2D: function setSampler2DArray(gl, location, cv, value) { gl.uniform1iv(location, value); },
    samplerCube: function setSampler2DArray(gl, location, cv, value) { gl.uniform1iv(location, value); },
    sampler2DArray: function setSampler2DArray(gl, location, cv, value) { gl.uniform1iv(location, value); },
};
/* eslint-disable max-len */

export default function staticUniformsSync(group, uniformData, ud, uv, renderer)
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
