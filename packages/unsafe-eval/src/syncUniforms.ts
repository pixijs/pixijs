import type { UniformGroup, IUniformData, Renderer, IRenderingContext } from '@pixi/core';

// cv = CachedValue
// v = value
// ud = uniformData
// uv = uniformValue
// l = location

/* eslint-disable max-len, @typescript-eslint/explicit-module-boundary-types */
const GLSL_TO_SINGLE_SETTERS = {
    float(gl: IRenderingContext, location: WebGLUniformLocation, cv: any, v: number): void
    {
        if (cv !== v)
        {
            cv.v = v;
            gl.uniform1f(location, v);
        }
    },
    vec2(gl: IRenderingContext, location: WebGLUniformLocation, cv: number[], v: number[]): void
    {
        if (cv[0] !== v[0] || cv[1] !== v[1])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            gl.uniform2f(location, v[0], v[1]);
        }
    },
    vec3(gl: IRenderingContext, location: WebGLUniformLocation, cv: number[], v: number[]): void
    {
        if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])
        {
            cv[0] = v[0];
            cv[1] = v[1];
            cv[2] = v[2];

            gl.uniform3f(location, v[0], v[1], v[2]);
        }
    },
    int(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number): void { gl.uniform1i(location, value); },
    ivec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform2i(location, value[0], value[1]); },
    ivec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform3i(location, value[0], value[1], value[2]); },
    ivec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },

    uint(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number): void { gl.uniform1ui(location, value); },
    uvec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform2ui(location, value[0], value[1]); },
    uvec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform3ui(location, value[0], value[1], value[2]); },
    uvec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform4ui(location, value[0], value[1], value[2], value[3]); },

    bool(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number): void { gl.uniform1i(location, value); },
    bvec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform2i(location, value[0], value[1]); },
    bvec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform3i(location, value[0], value[1], value[2]); },
    bvec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniform4i(location, value[0], value[1], value[2], value[3]); },

    mat2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniformMatrix2fv(location, false, value); },
    mat3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniformMatrix3fv(location, false, value); },
    mat4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number[]): void { gl.uniformMatrix4fv(location, false, value); },

    sampler2D(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number): void { gl.uniform1i(location, value); },
    samplerCube(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number): void { gl.uniform1i(location, value); },
    sampler2DArray(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: number): void { gl.uniform1i(location, value); },
};

const GLSL_TO_ARRAY_SETTERS = {
    float(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Float32List): void { gl.uniform1fv(location, value); },
    vec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Float32List): void { gl.uniform2fv(location, value); },
    vec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Float32List): void { gl.uniform3fv(location, value); },
    vec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Float32List): void { gl.uniform4fv(location, value); },
    int(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform1iv(location, value); },
    ivec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform2iv(location, value); },
    ivec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform3iv(location, value); },
    ivec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform4iv(location, value); },
    uint(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Uint32List): void { gl.uniform1uiv(location, value); },
    uvec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Uint32List): void { gl.uniform2uiv(location, value); },
    uvec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Uint32List): void { gl.uniform3uiv(location, value); },
    uvec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Uint32List): void { gl.uniform4uiv(location, value); },
    bool(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform1iv(location, value); },
    bvec2(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform2iv(location, value); },
    bvec3(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform3iv(location, value); },
    bvec4(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform4iv(location, value); },
    sampler2D(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform1iv(location, value); },
    samplerCube(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform1iv(location, value); },
    sampler2DArray(gl: IRenderingContext, location: WebGLUniformLocation, _cv: any, value: Int32List): void { gl.uniform1iv(location, value); },
};
/* eslint-disable max-len */

export function syncUniforms(group: UniformGroup, uniformData: {[x: string]: IUniformData}, ud: any, uv: any, renderer: Renderer): void
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

            (funcArray as any)[data.type].call(null, gl, udi.location, udi.value, uvi);
        }
    }
}
