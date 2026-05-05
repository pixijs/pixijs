import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render SVG-style elliptical arc',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        // First arc: sweepFlag=1 (clockwise)
        g.moveTo(20, 64);
        // arcToSvg(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y)
        g.arcToSvg(40, 30, 0, 0, 1, 100, 64);
        g.stroke({ width: 3, color: 'blue' });

        // Second arc: sweepFlag=0 (counter-clockwise)
        g.moveTo(20, 90);
        g.arcToSvg(40, 20, 0, 0, 0, 100, 90);
        g.stroke({ width: 3, color: 'red' });

        // Third arc: largeArcFlag=1
        g.moveTo(30, 30);
        g.arcToSvg(25, 25, 0, 1, 1, 80, 30);
        g.stroke({ width: 2, color: 'green' });

        scene.addChild(g);
    },
};
