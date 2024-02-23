import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import '../../../../src/compressed-textures/ktx/init';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
