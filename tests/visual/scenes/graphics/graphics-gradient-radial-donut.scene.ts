import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render radial donut gradient with non-zero inner radius',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0.2,
            outerCenter: { x: 0.5, y: 0.5 },
            outerRadius: 0.5,
            colorStops: [
                { offset: 0, color: 'rgba(255, 0, 0, 0)' },
                { offset: 0.5, color: 'rgba(255, 0, 0, 1)' },
                { offset: 1, color: 'rgba(0, 0, 255, 0)' },
            ],
            textureSpace: 'local',
        });

        const g = new Graphics();

        g.rect(10, 10, 108, 108).fill(gradient);
        scene.addChild(g);
    },
};
