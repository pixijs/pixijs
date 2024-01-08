// cu = Cached value's uniform data field
// cv = Cached value
// v = value to upload
// ud = uniformData
// uv = uniformValue

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

export const GLSL_TO_SINGLE_SETTERS_CACHED: Record<GLSL_TYPE, string> = {
    float: `if (cv !== v) {
            cu.value = v;
            gl.uniform1f(location, v);
        }`,
    vec2: `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }`,
    vec3: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3f(location, v[0], v[1], v[2]);
        }`,
    vec4: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }`,
    int: `if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,
    ivec2: `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,
    ivec3: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,
    ivec4: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,
    uint: `if (cv !== v) {
            cu.value = v;
            gl.uniform1ui(location, v);
        }`,
    uvec2: `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2ui(location, v[0], v[1]);
        }`,
    uvec3: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3ui(location, v[0], v[1], v[2]);
        }`,
    uvec4: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4ui(location, v[0], v[1], v[2], v[3]);
        }`,
    bool: `if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,
    bvec2: `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,
    bvec3: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,
    bvec4: `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,
    mat2: `gl.uniformMatrix2fv(location, false, v);`,
    mat3: `gl.uniformMatrix3fv(location, false, v);`,
    mat4: `gl.uniformMatrix4fv(location, false, v);`,
    sampler2D: `if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,
    samplerCube: `if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,
    sampler2DArray: `if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,
};

export const GLSL_TO_ARRAY_SETTERS: Record<GLSL_TYPE, string> = {
    float: `gl.uniform1fv(location, v);`,
    vec2: `gl.uniform2fv(location, v);`,
    vec3: `gl.uniform3fv(location, v);`,
    vec4: `gl.uniform4fv(location, v);`,
    mat2: `gl.uniformMatrix2fv(location, false, v);`,
    mat3: `gl.uniformMatrix3fv(location, false, v);`,
    mat4: `gl.uniformMatrix4fv(location, false, v);`,
    int: `gl.uniform1iv(location, v);`,
    ivec2: `gl.uniform2iv(location, v);`,
    ivec3: `gl.uniform3iv(location, v);`,
    ivec4: `gl.uniform4iv(location, v);`,
    uint: `gl.uniform1uiv(location, v);`,
    uvec2: `gl.uniform2uiv(location, v);`,
    uvec3: `gl.uniform3uiv(location, v);`,
    uvec4: `gl.uniform4uiv(location, v);`,
    bool: `gl.uniform1iv(location, v);`,
    bvec2: `gl.uniform2iv(location, v);`,
    bvec3: `gl.uniform3iv(location, v);`,
    bvec4: `gl.uniform4iv(location, v);`,
    sampler2D: `gl.uniform1iv(location, v);`,
    samplerCube: `gl.uniform1iv(location, v);`,
    sampler2DArray: `gl.uniform1iv(location, v);`,
};
