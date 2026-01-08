import { Container, Graphics } from '~/scene';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render diagonal gradients correctly (bottom-left to top-right)',
    create: async (scene: Container) =>
    {
        const size = 100;
        const spacing = 20;
        const colorStops = [
            { offset: 0, color: 'red' },
            { offset: 1, color: 'green' },
        ];

        // Test 1: Top-left to bottom-right (x: 0, y: 0 -> x: 1, y: 1)
        const gradient1 = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
            colorStops,
            textureSpace: 'local',
        });
        const graphic1 = new Graphics()
            .rect(0, 0, size, size)
            .fill(gradient1);

        // Test 2: Bottom-left to top-right (x: 0, y: 1 -> x: 1, y: 0) - THE BUG
        const gradient2 = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 1 },
            end: { x: 1, y: 0 },
            colorStops,
            textureSpace: 'local',
        });
        const graphic2 = new Graphics()
            .rect(size + spacing, 0, size, size)
            .fill(gradient2);

        // Test 3: Top-right to bottom-left (x: 1, y: 0 -> x: 0, y: 1)
        const gradient3 = new FillGradient({
            type: 'linear',
            start: { x: 1, y: 0 },
            end: { x: 0, y: 1 },
            colorStops,
            textureSpace: 'local',
        });
        const graphic3 = new Graphics()
            .rect(0, size + spacing, size, size)
            .fill(gradient3);

        // Test 4: Bottom-right to top-left (x: 1, y: 1 -> x: 0, y: 0)
        const gradient4 = new FillGradient({
            type: 'linear',
            start: { x: 1, y: 1 },
            end: { x: 0, y: 0 },
            colorStops,
            textureSpace: 'local',
        });
        const graphic4 = new Graphics()
            .rect(size + spacing, size + spacing, size, size)
            .fill(gradient4);

        const container = new Container();

        container.addChild(graphic1, graphic2, graphic3, graphic4);

        scene.addChild(container);
    },
};
