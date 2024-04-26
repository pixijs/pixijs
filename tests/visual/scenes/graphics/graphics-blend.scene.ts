import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
