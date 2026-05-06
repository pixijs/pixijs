import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render local radial gradient centered with non-default outerRadius',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0,
            outerRadius: 0.7,
            colorStops: [
                { offset: 0, color: 'white' },
                { offset: 0.5, color: 'blue' },
                { offset: 1, color: 'darkblue' },
            ],
            textureSpace: 'local',
        });

        const g = new Graphics();

        g.rect(10, 10, 108, 108).fill(gradient);
        scene.addChild(g);
    },
};
