import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render ellipse with stroke',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.ellipse(64, 64, 45, 28);
        g.fill(0x3366ff);
        g.stroke({ width: 4, color: 0x000000 });

        scene.addChild(g);
    },
};
