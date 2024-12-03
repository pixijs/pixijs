import { Graphics } from '~/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should max blend correctly',
    create: async (scene: Container) =>
    {
        const red = new Graphics().rect(0, 0, 100, 100).fill(0xff0000);
        const green = new Graphics().rect(0, 0, 100, 100).fill(0x00ff00);

        green.blendMode = 'max';

        scene.addChild(red, green);
    },
};
