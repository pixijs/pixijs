import { Assets } from '~/assets/Assets';
import { Color } from '~/color/Color';
import { Graphics } from '~/scene/graphics/shared/Graphics';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

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
