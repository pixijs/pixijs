import { drawSwatch, layoutSwatch } from './swatches';
import { Assets } from '~/assets';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

// ImageMagick 7.1 encoded these: bunny.png (26x37, which isn't whole blocks, so no mip levels) and a 32x32 gradient
// with its full mip chain. The KTX files hold the DXT5 files' blocks.
const files = [
    { asset: 'compressed-bunny-dxt1.dds', format: 'bc1-rgba-unorm', width: 26, height: 37, levels: 1 },
    { asset: 'compressed-bunny-dxt5.dds', format: 'bc3-rgba-unorm', width: 26, height: 37, levels: 1 },
    { asset: 'compressed-bunny-dxt5.ktx', format: 'bc3-rgba-unorm', width: 26, height: 37, levels: 1 },
    { asset: 'compressed-gradient-dxt1.dds', format: 'bc1-rgba-unorm', width: 32, height: 32, levels: 6 },
    { asset: 'compressed-gradient-dxt5.dds', format: 'bc3-rgba-unorm', width: 32, height: 32, levels: 6 },
    { asset: 'compressed-gradient-dxt5.ktx', format: 'bc3-rgba-unorm', width: 32, height: 32, levels: 6 },
];

/** Bunnies at their size and twice it, then gradients at their size with a bar per mip level */
export const swatches: (PlacedSwatch & { asset: string })[] = files.flatMap(({ asset, ...file }, i) =>
{
    if (i < 3)
    {
        const x = 2 + (i * 84);

        return [
            { asset, file, swatch: layoutSwatch(file, x, 2, 1) },
            { asset, file, swatch: layoutSwatch(file, x + 28, 2, 2) },
        ];
    }

    return [{ asset, file, swatch: layoutSwatch(file, 2 + ((i - 3) * 80), 80, 1, 40) }];
});

export const scene: TestScene = {
    it: 'should render DXT1 and DXT5 textures an encoder made, at sizes that are not whole blocks and with mip levels',
    excludeRenderers: ['canvas'],
    options: { width: 252, height: 120 },
    create: async (scene: Container) =>
    {
        for (const { asset, swatch } of swatches)
        {
            drawSwatch(scene, await Assets.load<Texture>(asset), swatch);
        }
    },
};
