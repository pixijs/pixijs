import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render circle mask correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 128, 128)
            .fill('red')
            .stroke({ color: 0x00FF00, width: 20, alignment: 1 });

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
