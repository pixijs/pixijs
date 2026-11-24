import { drawSwatches, layoutSwatch } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { TextureFile } from './textureFiles';
import type { Container } from '~/scene';

const files: TextureFile[] = [
    // FourCC headers: DXT1, DXT3, DXT5, ATI1, BC4S, ATI2 and BC5S
    ...['bc1-rgba-unorm', 'bc2-rgba-unorm', 'bc3-rgba-unorm', 'bc4-r-unorm', 'bc4-r-snorm', 'bc5-rg-unorm',
        'bc5-rg-snorm'].map((format) => ({ format, width: 16, height: 16, container: 'dds-legacy' as const })),
    // DX10 headers
    ...['bc1-rgba-unorm', 'bc1-rgba-unorm-srgb', 'bc2-rgba-unorm', 'bc2-rgba-unorm-srgb', 'bc3-rgba-unorm',
        'bc3-rgba-unorm-srgb', 'bc4-r-unorm', 'bc4-r-snorm', 'bc5-rg-unorm', 'bc5-rg-snorm', 'bc6h-rgb-ufloat',
        'bc6h-rgb-float', 'bc7-rgba-unorm', 'bc7-rgba-unorm-srgb'].map((format) =>
        ({ format, width: 16, height: 16, container: 'dds' as const })),
];

/**
 * Per file: a 16x16 texture with its full mip chain and a bar per smaller level, then the same format at 10x6, which
 * isn't whole blocks, at twice its size.
 */
export const swatches: PlacedSwatch[] = files.flatMap((file, i) =>
{
    const x = 2 + (Math.floor(i / 7) * 72);
    const y = 2 + ((i % 7) * 24);
    const swatch = layoutSwatch(file, x, y, 1, 34);
    const padded = { ...file, width: 10, height: 6, levels: 1 };

    return [{ file, swatch }, { file: padded, swatch: layoutSwatch(padded, swatch.right + 3, y, 1) }];
});

export const scene: TestScene = {
    it: 'should render every BC format from DDS files with FourCC and DX10 headers',
    excludeRenderers: ['canvas'],
    options: { width: 216, height: 170 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
