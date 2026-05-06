import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render rotated elliptical radial gradient',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0,
            outerRadius: 0.5,
            scale: 0.4,
            rotation: Math.PI / 4,
            colorStops: [
                { offset: 0, color: 'yellow' },
                { offset: 0.5, color: 'orange' },
                { offset: 1, color: 'purple' },
            ],
            textureSpace: 'local',
        });

        const g = new Graphics();

        g.rect(10, 10, 108, 108).fill(gradient);
        scene.addChild(g);
    },
};
