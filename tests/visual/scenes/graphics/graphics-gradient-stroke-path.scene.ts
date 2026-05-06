import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render gradient stroke on a zig-zag path',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            textureSpace: 'local',
            colorStops: [
                { offset: 0, color: 'red' },
                { offset: 0.5, color: 'yellow' },
                { offset: 1, color: 'blue' },
            ],
        });

        const g = new Graphics();

        g.moveTo(14, 30)
            .lineTo(40, 90)
            .lineTo(64, 30)
            .lineTo(88, 90)
            .lineTo(114, 30)
            .stroke({ width: 8, fill: gradient });

        scene.addChild(g);
    },
};
