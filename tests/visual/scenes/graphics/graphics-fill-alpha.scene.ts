import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render fill with alpha transparency',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        // Draw background rect
        g.rect(20, 20, 80, 80).fill('blue');

        // Draw overlapping rect with alpha
        g.rect(40, 40, 80, 80).fill({ color: 'red', alpha: 0.5 });

        scene.addChild(g);
    },
};
