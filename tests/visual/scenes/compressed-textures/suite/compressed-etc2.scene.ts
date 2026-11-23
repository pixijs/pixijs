import { drawSwatches, layoutSwatch } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Container } from '~/scene';

// KTX maps COMPRESSED_RG11_EAC to eac-rg11snorm, which no loader accepts, and the signed EAC formats have no mapping
const formats = [
    'etc2-rgb8unorm', 'etc2-rgb8unorm-srgb', 'etc2-rgb8a1unorm', 'etc2-rgb8a1unorm-srgb', 'etc2-rgba8unorm',
    'etc2-rgba8unorm-srgb', 'eac-r11unorm',
];

/**
 * Per format: a 16x16 texture with its full mip chain drawn at twice its size with a bar per smaller level, then a
 * 10x6 texture, which isn't whole blocks, at twice its size.
 */
export const swatches: PlacedSwatch[] = formats.flatMap((format, i) =>
{
    const y = 2 + (i * 34);
    const mipmapped = { format, width: 16, height: 16 };
    const padded = { format, width: 10, height: 6, levels: 1 };
    const swatch = layoutSwatch(mipmapped, 2, y, 2, 40);

    return [
        { file: mipmapped, swatch },
        { file: padded, swatch: layoutSwatch(padded, swatch.right + 3, y, 2) },
    ];
});

export const scene: TestScene = {
    it: 'should render every ETC2 and EAC format the KTX loader accepts',
    excludeRenderers: ['canvas'],
    options: { width: 104, height: 240 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
