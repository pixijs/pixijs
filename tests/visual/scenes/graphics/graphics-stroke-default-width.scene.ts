import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render strokes using the default width of 1',
    create: async (scene: Container) =>
    {
        const circle = new Graphics()
            .circle(32, 64, 20)
            .stroke({ color: 'black' });

        scene.addChild(circle);

        const rect = new Graphics()
            .rect(54, 44, 40, 40)
            .stroke({ color: 'black' });

        scene.addChild(rect);

        const explicit = new Graphics()
            .circle(108, 64, 14)
            .stroke({ color: 'black', width: 1 });

        scene.addChild(explicit);
    },
};
