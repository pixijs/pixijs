import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke filled with linear gradient in global space',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 128, y: 0 },
            colorStops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
            textureSpace: 'global',
        });

        const g = new Graphics();

        g.rect(14, 14, 100, 100);
        g.stroke({ width: 10, fill: gradient });

        scene.addChild(g);
    },
};
