import { Assets } from '~/assets';
import { ColorMatrixFilter } from '~/filters';
import { Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should nested masks correctly',
    create: async (scene: Container) =>
    {
        const filter = new ColorMatrixFilter();

        filter.hue(90, true);

        const texture = await Assets.load(`bunny.png`);

        const container = new Container();

        const sprite = new Sprite(texture);

        container.addChild(sprite);
        scene.addChild(container);

        sprite.width = 100;
        sprite.height = 100;

        sprite.filters = filter;

        const sprite2 = new Sprite(texture);

        container.addChild(sprite2);
        sprite2.x = 128 / 2;
        sprite2.y = 128 / 2;

        container.filters = filter;
    },
};
