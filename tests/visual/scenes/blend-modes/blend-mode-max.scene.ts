import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
