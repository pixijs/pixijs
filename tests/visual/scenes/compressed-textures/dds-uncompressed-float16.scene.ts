import { addMipBars, createUncompressedDDS } from './uncompressedDDS';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    it: 'should render every mip level of half float dds textures',
    create: async (scene: Container) =>
    {
        const formats = ['r16float', 'rg16float', 'rgba16float'];

        for (let i = 0; i < formats.length; i++)
        {
            await addMipBars(scene, createUncompressedDDS(formats[i], 16), 2 + (i * 42), 2, 40);
        }
    },
};
