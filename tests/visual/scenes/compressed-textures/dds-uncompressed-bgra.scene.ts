import { addMipBars, createUncompressedDDS } from './uncompressedDDS';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render bgra dds textures with red and blue in place',
    create: async (scene: Container) =>
    {
        const files = [
            createUncompressedDDS('rgba8unorm', 16),
            createUncompressedDDS('bgra8unorm', 16),
            createUncompressedDDS('rgba8unorm', 16, [0x000000ff, 0x0000ff00, 0x00ff0000, 0xff000000]),
            createUncompressedDDS('bgra8unorm', 16, [0x00ff0000, 0x0000ff00, 0x000000ff, 0xff000000]),
        ];

        for (let i = 0; i < files.length; i++)
        {
            await addMipBars(scene, files[i], 2 + (i * 32), 2, 28);
        }
    },
};
