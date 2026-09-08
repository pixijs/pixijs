import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render 5-pointed star with fill',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.star(64, 64, 5, 50, 25);
        g.fill(0xffcc00);

        scene.addChild(g);
    },
};
