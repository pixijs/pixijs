import { createUboElementsWGSL } from '../createUboElementsWGSL';

import type { UniformData } from '~/rendering';

describe('createUboElementsWGSL', () =>
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
                    size: [4, 16, 4],
                    offset: [0, 8, 24],
                    totalSize: 32
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
                    size: [16, 4, 16, 12],
                    offset: [0, 16, 24, 48],
                    totalSize: 64
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
            {
                values: [{ format: 'vec3<f32>', size: 3 }, 'mat3x3<f32>', 'vec2<f32>'],
                expected: {
                    size: [48, 48, 8],
                    offset: [0, 48, 96],
                    totalSize: 112
                },
            }
        ];

        toTest.forEach(({ values, expected }, i) =>
        {
            const uboData: UniformData[] = values.map((value) =>
            {
                if (typeof value === 'string')
                {
                    value = { format: value, size: 1 };
                }

                return {
                    name: `${i}-value`,
                    type: value.format as any, // UNIFORM_TYPES,
                    value: 0,
                    size: value.size,
                };
            });

            const uboResults = values.map((_value, i) =>
                ({
                    size: expected.size[i],
                    offset: expected.offset[i],
                }));

            const uboElements = createUboElementsWGSL(uboData);

            expect(uboElements).toMatchObject({
                uboElements: uboResults,
                size: expected.totalSize
            });
        });
    });
});
