import { Assets } from '~/assets';
import { Color } from '~/color';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render inverse alpha mask',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        rect.width = 100;
        rect.height = 100;

        const texture = await Assets.load('blurredCircle.png');
        const mask = new Sprite(texture);

        mask.width = 50;
        mask.height = 50;

        mask.anchor.set(0.5);

        mask.position.set(128 / 2);

        rect.mask = mask;
        rect.setMask({
            inverse: true,
        });

        scene.addChild(rect);
        scene.addChild(mask);
    },
};
