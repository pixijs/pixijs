import { Graphics, GraphicsPath } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should reuse GraphicsPath at multiple positions',
    create: async (scene: Container) =>
    {
        // Create reusable path
        const path = new GraphicsPath();

        path.rect(0, 0, 30, 30);

        const g = new Graphics();

        // First usage at origin offset
        g.translateTransform(10, 10);
        g.path(path).fill('red');

        // Reuse at different position
        g.translateTransform(40, 0);
        g.path(path).fill('blue');

        // Reuse at another position
        g.translateTransform(0, 40);
        g.path(path).fill('green');

        // Fourth instance with stroke
        g.translateTransform(-40, 0);
        g.path(path).fill('yellow');
        g.path(path).stroke({ width: 2, color: 'black' });

        scene.addChild(g);
    },
};
