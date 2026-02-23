import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should not render masked sprite, when mask is out of viewport bounds',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const sprite = new Sprite(texture);
        const mask = new Sprite(texture);

        sprite.mask = mask;
        mask.x = -256;

        scene.addChild(sprite);
        scene.addChild(mask);
    },
};
