import { drawSwatches, layoutSwatch } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { TextureFile } from './textureFiles';
import type { Container } from '~/scene';

// 8- and 16-byte BC blocks, a small and a large ASTC footprint, ETC2, and the two uncompressed formats WebGL1 draws
const rows: Partial<TextureFile>[] = [
    { format: 'bc1-rgba-unorm', container: 'ktx' },
    { format: 'bc3-rgba-unorm', container: 'dds' },
    { format: 'astc-6x6-unorm' },
    { format: 'astc-12x12-unorm' },
    { format: 'etc2-rgba8unorm' },
    { format: 'rgba8unorm', container: 'dds' },
    { format: 'bgra8unorm', container: 'dds-legacy' },
];

// [width, height, levels or undefined for the full chain, scale]: tiny, power of two and not, square and not.
// 4x4 has 2x2 and 1x1 levels below a whole block. A 2x2 BC or ETC2 texture with mip levels isn't here: padded to 4x4
// it lacks a 1x1 level, which WebGL1 needs to sample it.
const sizes: [number, number, number | undefined, number][] = [
    [1, 1, 1, 8], [2, 2, 1, 4], [4, 4, undefined, 2], [6, 10, undefined, 1], [12, 12, undefined, 1],
    [8, 16, undefined, 1], [32, 8, undefined, 1], [20, 20, undefined, 1],
];

/** One row per format, one swatch per size: the top level at the given scale and a bar per level it can select */
export const swatches: PlacedSwatch[] = rows.flatMap((row, i) =>
{
    let x = 2;

    return sizes.map(([width, height, levels, scale]) =>
    {
        const file = { ...row, width, height, levels } as TextureFile;
        const swatch = layoutSwatch(file, x, 2 + (i * 24), scale, 16);

        x = swatch.right + 3;

        return { file, swatch };
    });
});

export const scene: TestScene = {
    it: 'should render compressed textures from 1x1 up, square or not, power of two or not, with every mip level',
    excludeRenderers: ['canvas'],
    options: { width: 256, height: 170 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
