import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render global radial gradient with offset center (positive control)',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 60, y: 40 },
            innerRadius: 0,
            outerRadius: 50,
            colorStops: [
                { offset: 0, color: 'white' },
                { offset: 0.5, color: 'blue' },
                { offset: 1, color: 'darkblue' },
            ],
            textureSpace: 'global',
        });

        const g = new Graphics();

        g.rect(10, 10, 108, 108).fill(gradient);
        scene.addChild(g);
    },
};
