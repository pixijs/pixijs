import { drawSwatches, layoutSwatch } from './swatches';
import { astcFootprints } from './textureFiles';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Container } from '~/scene';

/**
 * Per sRGB footprint: a 16x16 texture with its full mip chain drawn at twice its size with a bar per smaller level,
 * then a 10x10 texture, which is whole blocks only for 5x5 and 10x10. The mid gray cells draw darker than authored,
 * since the sampled color is linear.
 */
export const swatches: PlacedSwatch[] = astcFootprints.flatMap((footprint, i) =>
{
    const format = `astc-${footprint}-unorm-srgb`;
    const x = 2 + (Math.floor(i / 7) * 92);
    const y = 2 + ((i % 7) * 34);
    const mipmapped = { format, width: 16, height: 16 };
    const small = { format, width: 10, height: 10, levels: 1 };
    const swatch = layoutSwatch(mipmapped, x, y, 2, 40);

    return [
        { file: mipmapped, swatch },
        { file: small, swatch: layoutSwatch(small, swatch.right + 3, y, 1) },
    ];
});

export const scene: TestScene = {
    it: 'should render every sRGB ASTC footprint with every mip level',
    excludeRenderers: ['canvas'],
    options: { width: 186, height: 240 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
