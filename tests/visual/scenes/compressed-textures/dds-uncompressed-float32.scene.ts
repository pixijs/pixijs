import { addMipBars, createUncompressedDDS } from './uncompressedDDS';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    it: 'should render every mip level of 32-bit float dds textures',
    create: async (scene: Container) =>
    {
        const formats = ['r32float', 'rg32float', 'rgba32float'];

        for (let i = 0; i < formats.length; i++)
        {
            await addMipBars(scene, createUncompressedDDS(formats[i], 16), 2 + (i * 42), 2, 40);
        }
    },
};
