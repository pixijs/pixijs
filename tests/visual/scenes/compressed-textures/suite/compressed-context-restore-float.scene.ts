import { drawSwatches, layoutSwatch, loseAndRestoreContext } from './swatches';

import type { TestScene } from '../../../types';
import type { PlacedSwatch } from './swatches';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

/** DDS formats WebGL2 uploads through typed-array views, plus unaligned rows, each 12x12 with its full mip chain */
export const swatches: PlacedSwatch[] = ['r16float', 'rgba16float', 'rg32float', 'rgba32float', 'rgb10a2unorm', 'rg8unorm']
    .map((format, i) =>
    {
        const file = { format, width: 12, height: 12, container: 'dds' as const };

        return { file, swatch: layoutSwatch(file, 2 + (Math.floor(i / 3) * 60), 2 + ((i % 3) * 26), 2, 30) };
    });

export const scene: TestScene = {
    it: 'should upload float and packed DDS textures again after the WebGL context is restored',
    renderers: { webgpu: true, webgl2: true, webgl1: false, canvas: false },
    options: { width: 120, height: 80 },
    create: async (scene: Container, renderer: Renderer) =>
    {
        await drawSwatches(scene, swatches);
        await loseAndRestoreContext(scene, renderer);
    },
};
