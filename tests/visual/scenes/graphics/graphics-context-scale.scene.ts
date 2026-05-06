import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render shape with scaleTransform',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.translateTransform(14, 14);
        g.scaleTransform(2, 2);
        g.rect(0, 0, 50, 50).fill('green');

        scene.addChild(g);
    },
};
