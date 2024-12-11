import '~/compressed-textures/ktx/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should load a ktx texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('test.bc3.mipmap.ktx');

        const sprite = new Sprite(texture);

        sprite.width = 128;
        sprite.height = 128;

        scene.addChild(sprite);
    },
};
