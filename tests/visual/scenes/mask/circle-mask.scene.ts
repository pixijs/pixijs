import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render circle mask correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 128, 128)
            .fill('red');

        const circle = new Graphics()
            .circle(128 / 2, 128 / 2, 128 / 2)
            .fill({
                color: 0xffffff,
                alpha: 1,
            });

        rect.mask = circle;

        scene.addChild(rect);
        scene.addChild(circle);
    },
};
