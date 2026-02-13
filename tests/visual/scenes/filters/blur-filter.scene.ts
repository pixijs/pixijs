import { BlurFilter } from '~/filters';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should correctly render a blurred black and white square',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const graphics = new Graphics()
            .rect(0, 0, 50, 50)
            .fill(0x000000)
            .rect(25, 25, 50, 50)
            .fill(0xffffff);

        graphics.position.set((128 - 75) / 2);

        graphics.filters = [new BlurFilter({ strength: 15, quality: 3 })];

        scene.addChild(graphics);
    },
};
