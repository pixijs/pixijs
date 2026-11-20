import '~/compressed-textures/ktx2/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should load a pma ktx2 texture and render it correctly',
    options: {
        width: 512,
        height: 64,
    },
    create: async (scene: Container) =>
    {
        const texture1 = await Assets.load('sample_test.png');
        const texture2 = await Assets.load('sample_test.uastc.pma.ktx2');

        const sprite1 = new Sprite(texture1);
        const sprite2 = new Sprite(texture2);

        sprite1.width = sprite2.width = 512;
        sprite1.height = sprite2.height = sprite2.y = 32;

        scene.addChild(sprite1, sprite2);
    },
};
