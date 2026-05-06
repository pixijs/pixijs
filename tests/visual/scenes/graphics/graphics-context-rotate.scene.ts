import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render shape with rotateTransform',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.translateTransform(64, 64);
        g.rotateTransform(Math.PI / 4);
        g.rect(-25, -25, 50, 50).fill('blue');

        scene.addChild(g);
    },
};
