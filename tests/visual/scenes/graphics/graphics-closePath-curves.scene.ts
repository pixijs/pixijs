import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should close path after curve-only segments',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.moveTo(20, 80)
            .bezierCurveTo(28, 16, 64, 16, 72, 56)
            .quadraticCurveTo(96, 36, 108, 72)
            .arc(80, 90, 22, -Math.PI / 4, Math.PI / 2)
            .closePath()
            .fill(0x9966ff);

        scene.addChild(g);
    },
};
