import { Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render linear local gradient repeated per-rect in shape-local space',
    create: async (scene: Container) =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
            textureSpace: 'local',
            colorStops: [
                { offset: 0, color: 'magenta' },
                { offset: 1, color: 'cyan' },
            ],
        });

        const g = new Graphics();

        g.rect(8, 8, 50, 50).fill(gradient);
        g.rect(64, 64, 56, 56).fill(gradient);
        scene.addChild(g);
    },
};
