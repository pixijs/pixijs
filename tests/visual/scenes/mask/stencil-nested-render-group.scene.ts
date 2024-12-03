/* eslint-disable max-len */

import { AlphaFilter } from '../../../../src/filters/defaults/alpha/AlphaFilter';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should nested masks in render group correctly',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        const padding = 20;

        g.rect(0, 0, 128 - padding, 128 - padding);
        g.fill({ color: 0xffff00 });
        g.x = padding / 2;
        g.y = padding / 2;
        scene.addChild(g);

        const mask = new Graphics();

        mask.circle((128 - padding) / 2, (128 - padding) / 2, 50);
        mask.fill({ color: 0xff0000 });
        mask.alpha = 0.5;
        g.addChild(mask);

        g.filters = [new AlphaFilter()];
        g.mask = mask;
        g.eventMode = 'static';

        g.enableRenderGroup();
    },
};
