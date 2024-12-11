import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should set tint of graphics correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics().rect(0, 0, 100, 100).fill('black');

        // should remain black!
        rect.tint = 0xff0000;

        scene.addChild(rect);
    },
};
