import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render roundShape with arc and quadratic corner modes',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        const left = [
            { x: 10, y: 20 },
            { x: 56, y: 20 },
            { x: 56, y: 80, radius: 14 },
            { x: 10, y: 80 },
        ];

        const right = [
            { x: 72, y: 20 },
            { x: 118, y: 20 },
            { x: 118, y: 80, radius: 14 },
            { x: 72, y: 80 },
        ];

        g.roundShape(left, 8, false).fill(0xff3366);
        g.roundShape(right, 8, true).fill(0x33aaff);

        scene.addChild(g);
    },
};
