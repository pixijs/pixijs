import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should min blend correctly',
    create: async (scene: Container) =>
    {
        const yellow = new Graphics().rect(0, 0, 100, 100).fill(0xffff00);
        const cyan = new Graphics().rect(0, 0, 100, 100).fill(0x00ffff);

        cyan.blendMode = 'min';

        scene.addChild(yellow, cyan);
    },
};
