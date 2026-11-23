import { drawSwatches, layoutSwatch } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Container } from '~/scene';

const formats = [
    'bc1-rgba-unorm', 'bc1-rgba-unorm-srgb', 'bc2-rgba-unorm', 'bc2-rgba-unorm-srgb', 'bc3-rgba-unorm',
    'bc3-rgba-unorm-srgb', 'bc4-r-unorm', 'bc4-r-snorm', 'bc5-rg-unorm', 'bc5-rg-snorm', 'bc6h-rgb-ufloat',
    'bc6h-rgb-float', 'bc7-rgba-unorm', 'bc7-rgba-unorm-srgb',
];

/**
 * Per format: a 16x16 texture with its full mip chain, drawn at twice its size with a bar per smaller level, then a
 * 10x6 texture, which isn't whole blocks, at twice its size.
 */
export const swatches: PlacedSwatch[] = formats.flatMap((format, i) =>
{
    const x = 2 + (Math.floor(i / 7) * 104);
    const y = 2 + ((i % 7) * 34);
    const mipmapped = { format, width: 16, height: 16 };
    const padded = { format, width: 10, height: 6, levels: 1 };
    const swatch = layoutSwatch(mipmapped, x, y, 2, 40);

    return [
        { file: mipmapped, swatch },
        { file: padded, swatch: layoutSwatch(padded, swatch.right + 3, y, 2) },
    ];
});

export const scene: TestScene = {
    it: 'should render every BC format from KTX files, with every mip level and at sizes that are not whole blocks',
    excludeRenderers: ['canvas'],
    options: { width: 208, height: 240 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
