import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render radial global gradient shared across two rects in world space',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 64, y: 64 },
            innerRadius: 0,
            outerRadius: 50,
            textureSpace: 'global',
            colorStops: [
                { offset: 0, color: 'white' },
                { offset: 0.5, color: 'orange' },
                { offset: 1, color: 'red' },
            ],
        });

        const g = new Graphics();

        g.rect(8, 8, 50, 50).fill(gradient);
        g.rect(64, 64, 56, 56).fill(gradient);
        scene.addChild(g);
    },
};
