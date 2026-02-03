import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render fill, cut, fill, cut.',
    create: async (scene: Container) =>
    {
        const rectsWithHoles = new Graphics()
            .rect(0, 0, 60, 60)
            .fill('black')
            .rect(10, 10, 40, 40)
            .cut()
            .rect(60, 60, 60, 60)
            .fill('blue')
            .rect(70, 70, 40, 40)
            .cut();

        scene.addChild(rectsWithHoles);
    },
};
