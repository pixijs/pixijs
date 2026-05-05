import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render filletRect with negative radius (convex corners)',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        // Negative fillet creates convex/outward corners
        g.filletRect(14, 14, 100, 100, -16).fill('orange');

        scene.addChild(g);
    },
};
