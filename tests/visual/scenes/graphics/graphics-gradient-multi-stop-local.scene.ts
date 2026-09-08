import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render linear gradient with multiple color stops',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            textureSpace: 'local',
            colorStops: [
                { offset: 0, color: 'red' },
                { offset: 0.25, color: 'yellow' },
                { offset: 0.5, color: 'green' },
                { offset: 0.75, color: 'blue' },
                { offset: 1, color: 'purple' },
            ],
        });

        const g = new Graphics();

        g.rect(10, 10, 108, 108).fill(gradient);
        scene.addChild(g);
    },
};
