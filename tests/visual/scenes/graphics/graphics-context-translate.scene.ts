import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render shape with translateTransform',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.translateTransform(40, 40);
        g.rect(0, 0, 50, 50).fill('red');

        scene.addChild(g);
    },
};
