import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke filled with texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');

        const g = new Graphics();

        g.rect(14, 14, 100, 100);
        g.stroke({ width: 15, texture });

        scene.addChild(g);
    },
};
