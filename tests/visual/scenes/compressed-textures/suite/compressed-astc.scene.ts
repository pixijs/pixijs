import { drawSwatches, layoutSwatch } from './swatches';
import { astcFootprints } from './textureFiles';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Container } from '~/scene';

/**
 * Per footprint: a 16x16 texture with its full mip chain, which is whole blocks only for 4x4 and 8x8, drawn at twice
 * its size with a bar per smaller level, then a texture two blocks wide and two blocks tall.
 */
export const swatches: PlacedSwatch[] = astcFootprints.flatMap((footprint, i) =>
{
    const [blockWidth, blockHeight] = footprint.split('x').map(Number);
    const format = `astc-${footprint}-unorm`;
    const x = 2 + (Math.floor(i / 7) * 108);
    const y = 2 + ((i % 7) * 34);
    const mipmapped = { format, width: 16, height: 16 };
    const whole = { format, width: blockWidth * 2, height: blockHeight * 2, levels: 1 };
    const swatch = layoutSwatch(mipmapped, x, y, 2, 40);

    return [
        { file: mipmapped, swatch },
        { file: whole, swatch: layoutSwatch(whole, swatch.right + 3, y, 1) },
    ];
});

export const scene: TestScene = {
    it: 'should render every ASTC footprint with every mip level, padded or whole blocks',
    excludeRenderers: ['canvas'],
    options: { width: 216, height: 240 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
