import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should set blend of graphics correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics().rect(0, 0, 100, 100).fill('red');

        rect.context.batchMode = 'no-batch';

        rect.blendMode = 'erase';

        scene.addChild(rect);
    },
};
