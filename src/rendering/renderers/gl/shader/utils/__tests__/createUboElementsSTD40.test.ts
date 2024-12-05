import { createUboElementsSTD40 } from '../createUboElementsSTD40';

import type { UNIFORM_TYPES, UniformData } from '~/rendering';

describe('createUboElementsSTD40', () =>
{
    it('do the things', async () =>
    {
        const toTest = [
            {
                values: ['mat3x3<f32>', 'vec3<f32>'],
                expected: {
                    size: [48, 12],
                    offset: [0, 48],
                    totalSize: 64
                },
            },
            {
                values: ['f32', 'vec3<f32>', 'vec3<f32>'],
                expected: {
                    size: [4, 12, 12],
                    offset: [0, 16, 32],
                    totalSize: 48
                },
            },
            {
                values: ['f32', 'f32', 'f32', 'f32'],
                expected: {
                    size: [4, 4, 4, 4],
                    offset: [0, 4, 8, 12],
                    totalSize: 16
                },
            },
            {
                values: ['f32', 'mat2x2<f32>', 'f32'],
                expected: {
                    size: [4, 32, 4],
                    offset: [0, 16, 48],
                    totalSize: 64
                },
            },
            {
                values: ['vec2<f32>', 'vec4<f32>', 'f32'],
                expected: {
                    size: [8, 16, 4],
                    offset: [0, 16, 32],
                    totalSize: 48
                },
            },
            {
                values: ['vec4<f32>', 'f32', 'mat2x2<f32>', 'vec3<f32>'],
                expected: {
                    size: [16, 4, 32, 12],
                    offset: [0, 16, 32, 64],
                    totalSize: 80
                },
            },
            {
                values: ['mat4x4<f32>', 'f32'],
                expected: {
                    size: [64, 4],
                    offset: [0, 64],
                    totalSize: 80
                },
            },

            {
                values: ['f32', 'vec2<f32>', 'mat4x4<f32>'],
                expected: {
                    size: [4, 8, 64],
                    offset: [0, 8, 16],
                    totalSize: 80
                },
            },
            {
                values: ['vec3<f32>', 'mat3x3<f32>', 'vec2<f32>'],
                expected: {
                    size: [12, 48, 8],
                    offset: [0, 16, 64],
                    totalSize: 80
                },
            },

        ];

        toTest.forEach(({ values, expected }, i) =>
        {
            const uboData: UniformData[] = values.map((value) =>
                ({
                    name: `${i}-value`,
                    type: value as UNIFORM_TYPES,
                    value: 0,
                    size: 1,
                }));

            const uboResults = values.map((_value, i) =>
                ({
                    size: expected.size[i],
                    offset: expected.offset[i],
                }));

            const uboElements = createUboElementsSTD40(uboData);

            expect(uboElements).toMatchObject({
                uboElements: uboResults,
                size: expected.totalSize
            });
        });
    });
});
