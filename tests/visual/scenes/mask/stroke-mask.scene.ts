import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke-only Graphics mask correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 128, 128)
            .fill('red');

        const mask = new Graphics()
            .circle(64, 64, 50)
            .stroke({ color: 0xffffff, width: 20 });

        rect.mask = mask;

        scene.addChild(rect);
        scene.addChild(mask);
    },
};
