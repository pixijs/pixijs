import { Color } from '~/color';
import { Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render alpha mask',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        const masky = new Sprite(Texture.WHITE);

        masky.width = 50;
        masky.height = 50;

        masky.anchor.set(0.5);

        masky.position.set(128 / 2);

        rect.mask = masky;

        scene.addChild(rect);
        scene.addChild(masky);
    },
};
