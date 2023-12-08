/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Parsers, each one of these will take a look at the type of shader property and uniform.
// if they pass the test function then the code function is called that returns a the shader upload code for that uniform.
// Shader upload code is automagically generated with these parsers.
// If no parser is valid then the default upload functions are used.
// exposing Parsers means that custom upload logic can be added to pixi's shaders.
// A good example would be a pixi rectangle can be directly set on a uniform.
// If the shader sees it it knows how to upload the rectangle structure as a vec4
// format is as follows:
//
// {
//     test: (data, uniform) => {} <--- test is this code should be used for this uniform
//     code: (name, uniform) => {} <--- returns the string of the piece of code that uploads the uniform
//     codeUbo: (name, uniform) => {} <--- returns the string of the piece of code that uploads the
//                                         uniform to a uniform buffer
// }
import { parseFunctionBody } from '../../utils/parseFunctionBody';

import type { Matrix } from '../../../../../maths/matrix/Matrix';
import type { PointLike } from '../../../../../maths/point/PointLike';
import type { Rectangle } from '../../../../../maths/shapes/Rectangle';
import type { UNIFORM_TYPES, UniformData } from './createUBOElements';

type UniformParserKey = 'UPLOAD_PIXI_MAT_TO_MAT3' | 'VEC4_RECTANGLE' | 'VEC2_POINT';

interface UniformParserDefinition
{
    test(data: UniformData): boolean;
    exec: (name: string, uv: any, data: any, offset: any, v: any) => void;
}

export interface UniformParser extends UniformParserDefinition
{
    type: UNIFORM_TYPES;
    code: string;
}

const parsers: Record<UniformParserKey, UniformParserDefinition> = {
    UPLOAD_PIXI_MAT_TO_MAT3: {
        test: (data: UniformData): boolean =>
        {
            const value = data.value as Matrix;

            return value.a !== undefined;
        },
        exec: (name: string, uv: any, data: any, offset: any, _v: any): void =>
        {
            // eslint-disable-next-line no-lone-blocks
            {
                const matrix = uv[name].toArray(true);

                data[offset] = matrix[0];
                data[offset + 1] = matrix[1];
                data[offset + 2] = matrix[2];

                data[offset + 4] = matrix[3];
                data[offset + 5] = matrix[4];
                data[offset + 6] = matrix[5];

                data[offset + 8] = matrix[6];
                data[offset + 9] = matrix[7];
                data[offset + 10] = matrix[8];
            }
        },
    },
    VEC4_RECTANGLE: {
        test: (data: UniformData): boolean =>
            data.type === 'vec4<f32>' && data.size === 1 && (data.value as Rectangle).width !== undefined,
        exec: (name: string, uv: any, data: any, offset: any, v: any): void =>
        {
            v = uv[name];

            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        },
    },
    VEC2_POINT: {
        test: (data: UniformData): boolean =>
            data.type === 'vec2<f32>' && data.size === 1 && (data.value as PointLike).x !== undefined,
        exec: (name: string, uv: any, data: any, offset: any, v: any): void =>
        {
            v = uv[name];

            data[offset] = v.x;
            data[offset + 1] = v.y;
        },
    },
};

export const uniformBufferParsers: UniformParser[] = [
    // uploading pixi matrix object to mat3
    {
        type: 'mat3x3<f32>',
        test: parsers.UPLOAD_PIXI_MAT_TO_MAT3.test,
        exec: parsers.UPLOAD_PIXI_MAT_TO_MAT3.exec,
        code: parseFunctionBody(parsers.UPLOAD_PIXI_MAT_TO_MAT3.exec)
    },
    // uploading a pixi rectangle as a vec4
    {
        type: 'vec4<f32>',
        test: parsers.VEC4_RECTANGLE.test,
        exec: parsers.VEC4_RECTANGLE.exec,
        code: parseFunctionBody(parsers.VEC4_RECTANGLE.exec)
    },
    // uploading a pixi point as a vec2
    {
        type: 'vec2<f32>',
        test: parsers.VEC2_POINT.test,
        exec: parsers.VEC2_POINT.exec,
        code: parseFunctionBody(parsers.VEC2_POINT.exec)
    },
    // uploading a pixi point as a vec2 with caching layer
    // {
    //     test: (data: any, uniform: any): boolean =>
    //         data.type === 'vec2' && data.size === 1 && uniform.x !== undefined,
    //     code: (name: string): string =>
    //         `
    //             v = uv.${name};

    //             data[offset] = v.x;
    //             data[offset+1] = v.y;
    //         `,
    // },
    // caching layer for a vec2
    // {
    //     test: (data: any): boolean =>
    //         data.type === 'vec2' && data.size === 1,
    //     code: (name: string): string =>
    //         `
    //             cv = ud["${name}"].value;
    //             v = uv["${name}"];

    //             if(cv[0] !== v[0] || cv[1] !== v[1])
    //             {
    //                 cv[0] = v[0];
    //                 cv[1] = v[1];
    //                 gl.uniform2f(ud["${name}"].location, v[0], v[1]);
    //             }
    //         `,
    // },
    // upload a pixi rectangle as a vec4 with caching layer
    // {
    //     test: (data: any, uniform: any): boolean =>
    //         data.type === 'vec4' && data.size === 1 && uniform.width !== undefined,
    //     code: (name: string): string =>
    //         `
    //                 v = uv.${name};

    //                 data[offset] = v.x;
    //                 data[offset+1] = v.y;
    //                 data[offset+2] = v.width;
    //                 data[offset+3] = v.height;
    //             `,
    // },
    // a caching layer for vec4 uploading
    // {
    //     test: (data: any): boolean =>
    //         data.type === 'vec4' && data.size === 1,
    //     code: (name: string): string =>
    //         `
    //             cv = ud["${name}"].value;
    //             v = uv["${name}"];

    //             if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])
    //             {
    //                 cv[0] = v[0];
    //                 cv[1] = v[1];
    //                 cv[2] = v[2];
    //                 cv[3] = v[3];

    //                 gl.uniform4f(ud["${name}"].location, v[0], v[1], v[2], v[3])
    //             }`,
    // },
];

