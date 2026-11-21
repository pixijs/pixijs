import { addMipBars, createUncompressedDDS } from './uncompressedDDS';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    it: 'should render every mip level of r8, rg8, rgb10a2 and srgb bgra dds textures',
    create: async (scene: Container) =>
    {
        const formats = ['r8unorm', 'rg8unorm', 'rgb10a2unorm', 'bgra8unorm-srgb'];

        for (let i = 0; i < formats.length; i++)
        {
            await addMipBars(scene, createUncompressedDDS(formats[i], 16), 2 + (i * 32), 2, 28);
        }
    },
};
