import { drawSwatches, layoutSwatch, loseAndRestoreContext } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { TextureFile } from './textureFiles';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

const place = (file: TextureFile, x: number, y: number, scale: number, barWidth = 0): PlacedSwatch =>
    ({ file, swatch: layoutSwatch(file, x, y, scale, barWidth) });

/**
 * A padded ASTC atlas, BC1 with mip levels, padded BC3, a BGRA DDS (uploaded through a red/blue swapped copy on WebGL)
 * and a 12x12 RGBA8 KTX with mip levels
 */
export const swatches: PlacedSwatch[] = [
    place({ format: 'astc-8x8-unorm', width: 44, height: 28, levels: 1 }, 2, 2, 1),
    place({ format: 'bc1-rgba-unorm', width: 16, height: 16 }, 50, 2, 2, 30),
    place({ format: 'bc3-rgba-unorm', width: 10, height: 6, levels: 1, container: 'dds' }, 2, 36, 2),
    place({ format: 'bgra8unorm', width: 16, height: 16, container: 'dds' }, 26, 36, 2, 30),
    place({ format: 'rgba8unorm', width: 12, height: 12, container: 'ktx' }, 2, 72, 2, 30),
];

export const scene: TestScene = {
    it: 'should upload compressed and uncompressed KTX and DDS textures again after the WebGL context is restored',
    excludeRenderers: ['canvas'],
    options: { width: 120, height: 104 },
    create: async (scene: Container, renderer: Renderer) =>
    {
        await drawSwatches(scene, swatches);
        await loseAndRestoreContext(scene, renderer);
    },
};
