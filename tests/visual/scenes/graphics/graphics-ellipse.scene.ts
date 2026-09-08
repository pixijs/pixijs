import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render ellipse with different x/y radii',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.ellipse(64, 64, 50, 30);
        g.fill(0xff0000);

        scene.addChild(g);
    },
};
