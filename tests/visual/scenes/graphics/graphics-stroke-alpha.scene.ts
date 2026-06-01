import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke with alpha transparency',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.rect(20, 20, 80, 80).fill('white');
        g.rect(30, 30, 60, 60).stroke({ width: 10, color: 'red', alpha: 0.5 });

        scene.addChild(g);
    },
};
