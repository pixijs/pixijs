import { drawSwatches, layoutSwatch } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { TextureFile } from './textureFiles';
import type { Container } from '~/scene';

const files: TextureFile[] = [
    ...['rgba8unorm', 'rgba8unorm-srgb', 'bgra8unorm', 'bgra8unorm-srgb', 'r8unorm', 'rg8unorm', 'rgb10a2unorm',
        'r16float', 'rg16float', 'rgba16float', 'r32float', 'rg32float', 'rgba32float'].map((format) =>
        ({ format, width: 12, height: 12, container: 'dds' as const })),
    { format: 'rgba8unorm', width: 12, height: 12, container: 'ktx' },
    { format: 'rgba8unorm-srgb', width: 12, height: 12, container: 'ktx' },
];

/**
 * Per file: a 12x12 texture with its full mip chain (12, 6, 3 and 1 pixels, so most rows aren't a multiple of 4
 * bytes) drawn at twice its size with a bar per smaller level, then a 5x3 texture at twice its size.
 */
export const swatches: PlacedSwatch[] = files.flatMap((file, i) =>
{
    const x = 2 + (Math.floor(i / 8) * 78);
    const y = 2 + ((i % 8) * 26);
    const swatch = layoutSwatch(file, x, y, 2, 30);
    const small = { ...file, width: 5, height: 3, levels: 1 };

    return [{ file, swatch }, { file: small, swatch: layoutSwatch(small, swatch.right + 3, y, 2) }];
});

export const scene: TestScene = {
    it: 'should render every uncompressed DDS format and KTX RGBA8 at sizes whose rows are not 4-byte aligned',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    options: { width: 158, height: 210 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
