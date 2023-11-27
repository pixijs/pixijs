import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
