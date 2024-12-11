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
// import { Texture } from '../../texture/Texture';

import type { Color } from '../../../../../color/Color';
import type { Matrix } from '../../../../../maths/matrix/Matrix';
import type { PointLike } from '../../../../../maths/point/PointLike';
import type { Rectangle } from '../../../../../maths/shapes/Rectangle';
import type { UNIFORM_TYPES, UniformData } from '../types';

export interface UniformParserDefinition
{
    type: UNIFORM_TYPES;
    test(data: UniformData): boolean;
    ubo?: string;
    uboWgsl?: string;
    uboStd40?: string;
    uniform?: string;
}

export const uniformParsers: UniformParserDefinition[] = [
    // uploading pixi matrix object to mat3
    {
        type: 'mat3x3<f32>',
        test: (data: UniformData): boolean =>
        {
            const value = data.value as Matrix;

            return value.a !== undefined;
        },
        ubo: `
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,
        uniform: `
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `
    },
    // uploading a pixi rectangle as a vec4
    {
        type: 'vec4<f32>',
        test: (data: UniformData): boolean =>
            data.type === 'vec4<f32>' && data.size === 1 && (data.value as Rectangle).width !== undefined,
        ubo: `
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,
        uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `
    },
    // uploading a pixi point as a vec2
    {
        type: 'vec2<f32>',
        test: (data: UniformData): boolean =>
            data.type === 'vec2<f32>' && data.size === 1 && (data.value as PointLike).x !== undefined,
        ubo:  `
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,
        uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `
    },
    // uploading a pixi color as a vec4
    {
        type: 'vec4<f32>',
        test: (data: UniformData): boolean =>
            data.type === 'vec4<f32>' && data.size === 1 && (data.value as Color).red !== undefined,
        ubo: `
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,
        uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `
    },
    // uploading a pixi color as a vec3
    {
        type: 'vec3<f32>',
        test: (data: UniformData): boolean =>
            data.type === 'vec3<f32>' && data.size === 1 && (data.value as Color).red !== undefined,
        ubo: `
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,
        uniform: `
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `
    },
];
