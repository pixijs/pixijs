import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke filled with radial gradient in global space',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 64, y: 64 },
            innerRadius: 0,
            outerRadius: 50,
            colorStops: [
                { offset: 0, color: 'yellow' },
                { offset: 1, color: 'red' },
            ],
            textureSpace: 'global',
        });

        const g = new Graphics();

        g.rect(14, 14, 100, 100);
        g.stroke({ width: 12, fill: gradient });

        scene.addChild(g);
    },
};
