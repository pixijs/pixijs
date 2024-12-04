/* eslint-disable max-len */
import { Assets } from '~/assets/Assets';
import { ColorMatrixFilter } from '~/filters/defaults/color-matrix/ColorMatrixFilter';
import { Container } from '~/scene/container/Container';
import { Sprite } from '~/scene/sprite/Sprite';

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
