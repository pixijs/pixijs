import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should correctly render a black circle',
    create: async (scene: Container) =>
    {
        const graphics1 = new Graphics()
            .circle(0, 0, 50 / 2)
            .fill(0x000000);

        graphics1.position.set(50);
        scene.addChild(graphics1);

        const graphics2 = new Graphics()
            .circle(0, 0, 50 / 2)
            .fill(0xffffff)
            .stroke(0x0);

        graphics2.position.set(128 - 50);
        scene.addChild(graphics2);
    },
};
