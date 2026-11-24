import '~/compressed-textures/dds/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render a bc5 dds texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('test.bc5.mipmap.dds');

        const sprite = new Sprite(texture);

        sprite.width = 128;
        sprite.height = 128;

        scene.addChild(sprite);
    },
};
