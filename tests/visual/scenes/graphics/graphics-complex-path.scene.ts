import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render complex path with mixed commands',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.moveTo(10, 64);
        g.lineTo(40, 20);
        g.bezierCurveTo(60, 10, 80, 40, 90, 64);
        g.arc(90, 90, 26, -Math.PI / 2, Math.PI / 2);
        g.lineTo(40, 116);
        g.closePath();
        g.fill('purple');
        g.stroke({ width: 2, color: 'black' });

        scene.addChild(g);
    },
};
