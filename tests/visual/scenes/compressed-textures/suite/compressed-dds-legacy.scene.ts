import { drawSwatches, layoutSwatch } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Container } from '~/scene';

// headers without a DX10 extension: RGB bit masks (A8B8G8R8, A8R8G8B8, D3DX's swapped A2B10G10R10, R32F, A8L8 and
// L8) or D3DFMT codes 111 to 116 in the FourCC field
const formats = [
    'rgba8unorm', 'bgra8unorm', 'rgb10a2unorm', 'r32float', 'rg8unorm', 'r8unorm', 'r16float', 'rg16float',
    'rgba16float', 'rg32float', 'rgba32float',
];

/**
 * Per format: a 16x16 texture with its full mip chain and a bar per smaller level, then a 6x2 texture at twice its
 * size.
 */
export const swatches: PlacedSwatch[] = formats.flatMap((format, i) =>
{
    const x = 2 + (Math.floor(i / 6) * 76);
    const y = 2 + ((i % 6) * 24);
    const file = { format, width: 16, height: 16, container: 'dds-legacy' as const };
    const swatch = layoutSwatch(file, x, y, 1, 40);
    const small = { ...file, width: 6, height: 2, levels: 1 };

    return [{ file, swatch }, { file: small, swatch: layoutSwatch(small, swatch.right + 3, y, 2) }];
});

export const scene: TestScene = {
    it: 'should render uncompressed DDS files with legacy headers',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    options: { width: 154, height: 146 },
    create: (scene: Container) => drawSwatches(scene, swatches),
};
