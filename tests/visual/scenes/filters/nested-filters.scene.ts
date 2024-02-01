/* eslint-disable max-len */
import { Assets } from '../../../../src/assets/Assets';
import { ColorMatrixFilter } from '../../../../src/filters/defaults/color-matrix/ColorMatrixFilter';
import { Container } from '../../../../src/scene/container/Container';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

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
