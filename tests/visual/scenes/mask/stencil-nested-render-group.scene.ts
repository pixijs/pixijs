import { AlphaFilter } from '~/filters';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should handle nested masks in render group correctly',
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
