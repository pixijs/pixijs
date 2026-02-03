import { Assets } from '~/assets';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should nested masks correctly',
    create: async (scene: Container) =>
    {
        const innerMask = new Graphics().rect(0, 0, 100, 100).fill('red');
        const container = new Container();

        const outerMask = new Graphics().rect(0, 0, 75, 75).fill('blue');

        const texture = await Assets.load('profile-abel@0.5x.jpg');
        const texture2 = await Assets.load('blurredCircle.png');

        const sprite = new Sprite(texture);
        const sprite2 = new Sprite(texture2);

        scene.addChild(container);
        scene.addChild(outerMask);
        container.addChild(sprite);
        container.addChild(innerMask);

        container.mask = outerMask;
        container.addChild(sprite2);
        sprite.mask = innerMask;

        scene.position.set((128 - 75) / 2);
    },
};
