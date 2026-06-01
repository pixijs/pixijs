import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render linear gradient with mirror-repeat wrap mode',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 32, y: 0 },
            textureSpace: 'global',
            wrapMode: 'mirror-repeat',
            colorStops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
        });

        const g = new Graphics();

        g.rect(0, 0, 128, 128).fill(gradient);
        scene.addChild(g);
    },
};
