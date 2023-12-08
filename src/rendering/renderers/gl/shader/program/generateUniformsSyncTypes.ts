// cu = Cached value's uniform data field
// cv = Cached value
// v = value to upload
// ud = uniformData
// uv = uniformValue

import { parseFunctionBody } from '../../../shared/utils/parseFunctionBody';

type SingleSetterFunction = (cu: any, cv: any, v: any, location: WebGLUniformLocation, gl: any) => void;
export type ArraySetterFunction = (v: any, location: WebGLUniformLocation, gl: any) => void;

export type GLSL_TYPE =
| 'float'
| 'vec2'
| 'vec3'
| 'vec4'
| 'mat2'
| 'mat3'
| 'mat4'
| 'int'
| 'ivec2'
| 'ivec3'
| 'ivec4'
| 'uint'
| 'uvec2'
| 'uvec3'
| 'uvec4'
| 'bool'
| 'bvec2'
| 'bvec3'
| 'bvec4'
| 'sampler2D'
| 'samplerCube'
| 'sampler2DArray';

export const GLSL_TO_SINGLE_SETTERS_FN_CACHED: Record<GLSL_TYPE, SingleSetterFunction> = {
    float: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;
            gl.uniform1f(location, v);
        }
    },
    vec2: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];

            gl.uniform2f(location, v[0], v[1]);
        }
    },

    vec3: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3f(location, v[0], v[1], v[2]);
        }
    },

    vec4: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];

            gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }
    },

    int: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;

            gl.uniform1i(location, v);
        }
    },
    ivec2: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];

            gl.uniform2i(location, v[0], v[1]);
        }
    },
    ivec3: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3i(location, v[0], v[1], v[2]);
        }
    },
    ivec4: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];

            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }
    },
    uint: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;

            gl.uniform1ui(location, v);
        }
    },
    uvec2: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];

            gl.uniform2ui(location, v[0], v[1]);
        }
    },
    uvec3: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3ui(location, v[0], v[1], v[2]);
        }
    },
    uvec4: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];

            gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
        }
    },
    bool: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;
            gl.uniform1i(location, v);
        }
    },
    bvec2: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];

            gl.uniform2i(location, v[0], v[1]);
        }
    },
    bvec3: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3i(location, v[0], v[1], v[2]);
        }
    },
    bvec4: (_cu, cv, v, location, gl) =>
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];

            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }
    },
    mat2: (_cu, _cv, v, location, gl) =>
    {
        gl.uniformMatrix2fv(location, false, v);
    },
    mat3: (_cu, _cv, v, location, gl) =>
    {
        gl.uniformMatrix3fv(location, false, v);
    },
    mat4: (_cu, _cv, v, location, gl) =>
    {
        gl.uniformMatrix4fv(location, false, v);
    },
    sampler2D: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;

            gl.uniform1i(location, v);
        }
    },
    samplerCube: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;

            gl.uniform1i(location, v);
        }
    },
    sampler2DArray: (cu, cv, v, location, gl) =>
    {
        if (cv !== v)
        {
            cu.value = v;

            gl.uniform1i(location, v);
        }
    },

};

// l = location
export const GLSL_TO_SINGLE_SETTERS_CACHED: Record<GLSL_TYPE, string> = {
    float: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.float),

    vec2: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.vec2),
    vec3: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.vec3),
    vec4: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.vec4),

    int: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.int),

    ivec2: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.ivec2),
    ivec3: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.ivec3),
    ivec4: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.ivec4),

    uint: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.uint),

    uvec2: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.uvec2),
    uvec3: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.uvec3),
    uvec4: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.uvec4),

    bool: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.bool),

    bvec2: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.bvec2),
    bvec3: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.bvec3),
    bvec4: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.bvec4),

    mat2: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.mat2),
    mat3: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.mat3),
    mat4: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.mat4),

    sampler2D: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.sampler2D),
    samplerCube: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.samplerCube),
    sampler2DArray: parseFunctionBody(GLSL_TO_SINGLE_SETTERS_FN_CACHED.sampler2DArray),
};

export const GLSL_TO_ARRAY_SETTERS_FN: Record<GLSL_TYPE, ArraySetterFunction> = {
    float: (v, location, gl) =>
    {
        gl.uniform1fv(location, v);
    },
    vec2: (v, location, gl) =>
    {
        gl.uniform2fv(location, v);
    },
    vec3: (v, location, gl) =>
    {
        gl.uniform3fv(location, v);
    },
    vec4: (v, location, gl) =>
    {
        gl.uniform4fv(location, v);
    },

    mat2: (v, location, gl) =>
    {
        gl.uniformMatrix2fv(location, false, v);
    },
    mat3: (v, location, gl) =>
    {
        gl.uniformMatrix3fv(location, false, v);
    },
    mat4: (v, location, gl) =>
    {
        gl.uniformMatrix4fv(location, false, v);
    },

    int: (v, location, gl) =>
    {
        gl.uniform1iv(location, v);
    },
    ivec2: (v, location, gl) =>
    {
        gl.uniform2iv(location, v);
    },
    ivec3: (v, location, gl) =>
    {
        gl.uniform3iv(location, v);
    },
    ivec4: (v, location, gl) =>
    {
        gl.uniform4iv(location, v);
    },

    uint: (v, location, gl) =>
    {
        gl.uniform1uiv(location, v);
    },
    uvec2: (v, location, gl) =>
    {
        gl.uniform2uiv(location, v);
    },
    uvec3: (v, location, gl) =>
    {
        gl.uniform3uiv(location, v);
    },
    uvec4: (v, location, gl) =>
    {
        gl.uniform4uiv(location, v);
    },

    bool: (v, location, gl) =>
    {
        gl.uniform1iv(location, v);
    },
    bvec2: (v, location, gl) =>
    {
        gl.uniform2iv(location, v);
    },
    bvec3: (v, location, gl) =>
    {
        gl.uniform3iv(location, v);
    },
    bvec4: (v, location, gl) =>
    {
        gl.uniform4iv(location, v);
    },

    sampler2D: (v, location, gl) =>
    {
        gl.uniform1iv(location, v);
    },
    samplerCube: (v, location, gl) =>
    {
        gl.uniform1iv(location, v);
    },
    sampler2DArray: (v, location, gl) =>
    {
        gl.uniform1iv(location, v);
    },
};

export const GLSL_TO_ARRAY_SETTERS: Record<GLSL_TYPE, string> = {
    float: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.float),

    vec2: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.vec2),
    vec3: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.vec3),
    vec4: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.vec4),

    mat4: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.mat4),
    mat3: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.mat3),
    mat2: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.mat2),

    int: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.int),
    ivec2: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.ivec2),
    ivec3: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.ivec3),
    ivec4: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.ivec4),

    uint: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.uint),
    uvec2: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.uvec2),
    uvec3: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.uvec3),
    uvec4: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.uvec4),

    bool: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.bool),
    bvec2: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.bvec2),
    bvec3: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.bvec3),
    bvec4: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.bvec4),

    sampler2D: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.sampler2D),
    samplerCube: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.samplerCube),
    sampler2DArray: parseFunctionBody(GLSL_TO_ARRAY_SETTERS_FN.sampler2DArray),
};

