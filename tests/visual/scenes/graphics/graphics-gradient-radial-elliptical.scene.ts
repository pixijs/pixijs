import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render elliptical radial gradient using scale',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0,
            outerRadius: 0.5,
            scale: 0.5,
            colorStops: [
                { offset: 0, color: 'lime' },
                { offset: 0.6, color: 'green' },
                { offset: 1, color: 'darkgreen' },
            ],
            textureSpace: 'local',
        });

        const g = new Graphics();

        g.rect(10, 10, 108, 108).fill(gradient);
        scene.addChild(g);
    },
};
