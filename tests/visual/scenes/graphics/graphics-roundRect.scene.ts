import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render rounded rectangle with uniform radius',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.roundRect(14, 24, 100, 80, 16);
        g.fill(0x22bb55);

        scene.addChild(g);
    },
};
