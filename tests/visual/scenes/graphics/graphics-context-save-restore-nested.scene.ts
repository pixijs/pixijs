import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should handle nested save/restore correctly',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        // Level 0: base position
        g.translateTransform(10, 10);
        g.rect(0, 0, 20, 20).fill('red');

        // Save level 1
        g.save();
        g.translateTransform(30, 0);
        g.rect(0, 0, 20, 20).fill('orange');

        // Save level 2
        g.save();
        g.translateTransform(30, 0);
        g.rect(0, 0, 20, 20).fill('yellow');

        // Restore to level 1
        g.restore();
        g.translateTransform(0, 30);
        g.rect(0, 0, 20, 20).fill('green');

        // Restore to level 0
        g.restore();
        g.translateTransform(0, 60);
        g.rect(0, 0, 20, 20).fill('blue');

        // Another nested sequence
        g.save();
        g.translateTransform(60, -60);
        g.rect(0, 0, 20, 20).fill('purple');
        g.restore();

        scene.addChild(g);
    },
};
