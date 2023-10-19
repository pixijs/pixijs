/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Parsers, the code for the parsers are defined as functions first, and then converted to strings.
// Standard mode is to use the src strings to build dynamic functions, though unsafe-eval uses the actual function
// to execute the equivalent code without using eval-like methods.
// Each one of these parsers will take a look at the type of shader property and uniform.
// if they pass the test function then the code is generated/called that returns the shader upload code for that uniform.
// If no parser is valid then the default upload functions are used.
// exposing Parsers means that custom upload logic can be added to pixi's shaders.
// A good example would be a pixi rectangle can be directly set on a uniform.
// If the shader sees it it knows how to upload the rectangle structure as a vec4
// format is as follows:
//
// {
//     test: (data, uniform) => {} <--- test is this code should be used for this uniform
//     eslint-disable-next-line max-len
//     exec: (name: any, cv: any, ud: any, uv: any, v: any, t: any, gl: any, renderer: any, syncData: any) => void <--- returns the string of the piece of code that uploads the uniform
//     eslint-disable-next-line max-len
//     code: string <--- returns the string of the piece of code that uploads the uniform to a uniform buffer (this is derived from the exec function source)
// }

import { Texture } from '../../../shared/texture/Texture';
import { parseFunctionBody } from '../../../shared/utils/parseFunctionBody';

type UniformParserKey =
    | 'FLOAT_CACHE_LAYER'
    | 'HANDLE_SAMPLERS'
    | 'UPLOAD_PIXI_MAT3'
    | 'UPLOAD_PIXI_VEC2_CACHE'
    | 'VEC2_CACHE_LAYER'
    | 'UPLOAD_PIXI_RECT_VEC4_CACHE'
    | 'UPLOAD_PIXI_COLOR_VEC4_CACHE'
    | 'UPLOAD_PIXI_COLOR_VEC3_CACHE'
    | 'VEC4_CACHE_LAYER';

interface UniformParserDefinition
{
    test(data: unknown, uniform: any): boolean;
    exec(name: any, cv: any, ud: any, uv: any, v: any, t: any, gl: any, renderer: any, syncData: any): void;
}

export interface IUniformParser extends UniformParserDefinition
{
    code: string;
}

const parsers: Record<UniformParserKey, UniformParserDefinition> = {
    FLOAT_CACHE_LAYER: {
        test: (data: any): boolean =>
            data.type === 'float' && data.size === 1 && !data.isArray,
        exec: (name: string, _cv: any, ud: any, uv: any, _v: any, _t: any, gl: any, _renderer: any): void =>
        {
            if (uv[name] !== ud[name].value)
            {
                ud[name].value = uv[name];
                gl.uniform1f(ud[name].location, uv[name]);
            }
        }
    },
    HANDLE_SAMPLERS: {
        test: (data: any, uniform: any): boolean =>
            (data.type === 'sampler2D' || data.type === 'samplerCube' || data.type === 'sampler2DArray')
            && data.size === 1 && !data.isArray && (uniform === null || uniform instanceof Texture),
        exec: (name: string, _cv: any, ud: any, uv: any, _v: any, t: any, gl: any, renderer: any, syncData: any): void =>
        {
            t = syncData.textureCount++;
            renderer.texture.bind(uv[name], t);
            if (ud[name].value !== t)
            {
                ud[name].value = t;
                gl.uniform1i(ud[name].location, t);
            }
        }
    },
    UPLOAD_PIXI_MAT3: {
        test: (data: any, uniform: any): boolean =>
            data.type === 'mat3' && data.size === 1 && !data.isArray && uniform.a !== undefined,
        exec: (name: string, _cv: any, ud: any, uv: any, _v: any, _t: any, gl: any): void =>
        {
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        }
    },
    UPLOAD_PIXI_VEC2_CACHE: {
        test: (data: any, uniform: any): boolean =>
            data.type === 'vec2' && data.size === 1 && !data.isArray && uniform.x !== undefined,
        exec: (name: string, cv: any, ud: any, uv: any, v: any, _t: any, gl: any): void =>
        {
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y)
            {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        }
    },
    VEC2_CACHE_LAYER: {
        test: (data: any): boolean =>
            data.type === 'vec2' && data.size === 1 && !data.isArray,
        exec: (name: string, cv: any, ud: any, uv: any, v: any, _t: any, gl: any): void =>
        {
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v[0] || cv[1] !== v[1])
            {
                cv[0] = v[0];
                cv[1] = v[1];
                gl.uniform2f(ud[name].location, v[0], v[1]);
            }
        }
    },
    UPLOAD_PIXI_RECT_VEC4_CACHE: {
        test: (data: any, uniform: any): boolean =>
            data.type === 'vec4' && data.size === 1 && !data.isArray && uniform.width !== undefined,
        exec: (name: string, cv: any, ud: any, uv: any, v: any, _t: any, gl: any): void =>
        {
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)
            {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        }
    },
    UPLOAD_PIXI_COLOR_VEC4_CACHE: {
        test: (data: any, uniform: any): boolean =>
            data.type === 'vec4' && data.size === 1 && !data.isArray && uniform.red !== undefined,
        exec: (name: string, cv: any, ud: any, uv: any, v: any, _t: any, gl: any): void =>
        {
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha)
            {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        }
    },
    UPLOAD_PIXI_COLOR_VEC3_CACHE: {
        test: (data: any, uniform: any): boolean =>
            data.type === 'vec3' && data.size === 1 && !data.isArray && uniform.red !== undefined,
        exec: (name: string, cv: any, ud: any, uv: any, v: any, _t: any, gl: any): void =>
        {
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue)
            {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;

                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        }
    },
    VEC4_CACHE_LAYER: {
        test: (data: any): boolean =>
            data.type === 'vec4' && data.size === 1 && !data.isArray,
        exec: (name: string, cv: any, ud: any, uv: any, v: any, _t: any, gl: any): void =>
        {
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
            {
                cv[0] = v[0];
                cv[1] = v[1];
                cv[2] = v[2];
                cv[3] = v[3];
                gl.uniform4f(ud[name].location, v[0], v[1], v[2], v[3]);
            }
        }
    }
};

export const uniformParsers: IUniformParser[] = [

    // a float cache layer
    {
        test: parsers.FLOAT_CACHE_LAYER.test,
        code: parseFunctionBody(parsers.FLOAT_CACHE_LAYER.exec),
        exec: parsers.FLOAT_CACHE_LAYER.exec
    },
    // handling samplers
    {
        test: parsers.HANDLE_SAMPLERS.test,
        code: parseFunctionBody(parsers.HANDLE_SAMPLERS.exec),
        exec: parsers.HANDLE_SAMPLERS.exec
    },
    // uploading pixi matrix object to mat3
    {
        test: parsers.UPLOAD_PIXI_MAT3.test,
        code: parseFunctionBody(parsers.UPLOAD_PIXI_MAT3.exec),
        exec: parsers.UPLOAD_PIXI_MAT3.exec
    },
    // uploading a pixi point as a vec2 with caching layer
    {
        test: parsers.UPLOAD_PIXI_VEC2_CACHE.test,
        code: parseFunctionBody(parsers.UPLOAD_PIXI_VEC2_CACHE.exec),
        exec: parsers.UPLOAD_PIXI_VEC2_CACHE.exec
    },
    // caching layer for a vec2
    {
        test: parsers.VEC2_CACHE_LAYER.test,
        code: parseFunctionBody(parsers.VEC2_CACHE_LAYER.exec),
        exec: parsers.VEC2_CACHE_LAYER.exec
    },
    // upload a pixi rectangle as a vec4 with caching layer
    {
        test: parsers.UPLOAD_PIXI_RECT_VEC4_CACHE.test,
        code: parseFunctionBody(parsers.UPLOAD_PIXI_RECT_VEC4_CACHE.exec),
        exec: parsers.UPLOAD_PIXI_RECT_VEC4_CACHE.exec
    },
    // upload a pixi color as vec4 with caching layer
    {
        test: parsers.UPLOAD_PIXI_COLOR_VEC4_CACHE.test,
        code: parseFunctionBody(parsers.UPLOAD_PIXI_COLOR_VEC4_CACHE.exec),
        exec: parsers.UPLOAD_PIXI_COLOR_VEC4_CACHE.exec
    },
    // upload a pixi color as a vec3 with caching layer
    {
        test: parsers.UPLOAD_PIXI_COLOR_VEC3_CACHE.test,
        code: parseFunctionBody(parsers.UPLOAD_PIXI_COLOR_VEC3_CACHE.exec),
        exec: parsers.UPLOAD_PIXI_COLOR_VEC3_CACHE.exec
    },

    // a caching layer for vec4 uploading
    {
        test: parsers.VEC4_CACHE_LAYER.test,
        code: parseFunctionBody(parsers.VEC4_CACHE_LAYER.exec),
        exec: parsers.VEC4_CACHE_LAYER.exec
    },
];

