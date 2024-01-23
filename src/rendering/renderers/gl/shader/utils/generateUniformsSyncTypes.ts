// cu = Cached value's uniform data field
// cv = Cached value
// v = value to upload
// ud = uniformData
// uv = uniformValue

import type { UNIFORM_TYPES } from '../../../shared/shader/types';

export type ArraySetterFunction = (v: any, location: WebGLUniformLocation, gl: any) => void;

export const UNIFORM_TO_SINGLE_SETTERS: Record<UNIFORM_TYPES | string, string> = {
    f32: `if (cv !== v) {
            cu.value = v;
            gl.uniform1f(location, v);
        }`,
    'vec2<f32>': `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }`,
    'vec3<f32>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3f(location, v[0], v[1], v[2]);
        }`,
    'vec4<f32>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4f(location, v[0], v[1], v[2], v[3]);
        }`,
    i32: `if (cv !== v) {
            cu.value = v;
            gl.uniform1i(location, v);
        }`,
    'vec2<i32>': `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,
    'vec3<i32>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,
    'vec4<i32>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,
    u32: `if (cv !== v) {
            cu.value = v;
            gl.uniform1ui(location, v);
        }`,
    'vec2<u32>': `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2ui(location, v[0], v[1]);
        }`,
    'vec3<u32>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3ui(location, v[0], v[1], v[2]);
        }`,
    'vec4<u32>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
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
    'vec2<bool>': `if (cv[0] !== v[0] || cv[1] !== v[1]) {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2i(location, v[0], v[1]);
        }`,
    'vec3<bool>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            gl.uniform3i(location, v[0], v[1], v[2]);
        }`,
    'vec4<bool>': `if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3]) {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];
            cv[3] = v[3];
            gl.uniform4i(location, v[0], v[1], v[2], v[3]);
        }`,
    'mat2x2<f32>': `gl.uniformMatrix2fv(location, false, v);`,
    'mat3x3<f32>': `gl.uniformMatrix3fv(location, false, v);`,
    'mat4x4<f32>': `gl.uniformMatrix4fv(location, false, v);`,
};

export const UNIFORM_TO_ARRAY_SETTERS: Record<UNIFORM_TYPES | string, string> = {
    f32: `gl.uniform1fv(location, v);`,
    'vec2<f32>': `gl.uniform2fv(location, v);`,
    'vec3<f32>': `gl.uniform3fv(location, v);`,
    'vec4<f32>': `gl.uniform4fv(location, v);`,
    'mat2x2<f32>': `gl.uniformMatrix2fv(location, false, v);`,
    'mat3x3<f32>': `gl.uniformMatrix3fv(location, false, v);`,
    'mat4x4<f32>': `gl.uniformMatrix4fv(location, false, v);`,
    i32: `gl.uniform1iv(location, v);`,
    'vec2<i32>': `gl.uniform2iv(location, v);`,
    'vec3<i32>': `gl.uniform3iv(location, v);`,
    'vec4<i32>': `gl.uniform4iv(location, v);`,
    u32: `gl.uniform1iv(location, v);`,
    'vec2<u32>': `gl.uniform2iv(location, v);`,
    'vec3<u32>': `gl.uniform3iv(location, v);`,
    'vec4<u32>': `gl.uniform4iv(location, v);`,
    bool: `gl.uniform1iv(location, v);`,
    'vec2<bool>': `gl.uniform2iv(location, v);`,
    'vec3<bool>': `gl.uniform3iv(location, v);`,
    'vec4<bool>': `gl.uniform4iv(location, v);`,
};
