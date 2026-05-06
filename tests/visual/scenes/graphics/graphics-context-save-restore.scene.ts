import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should handle save/restore correctly',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        // Draw first shape with transform
        g.translateTransform(20, 20);
        g.rect(0, 0, 30, 30).fill('red');

        // Save state
        g.save();

        // Apply more transforms
        g.translateTransform(40, 0);
        g.rect(0, 0, 30, 30).fill('blue');

        // Restore (back to first transform state)
        g.restore();

        // This should draw at (20, 60), not (60, 60)
        g.translateTransform(0, 40);
        g.rect(0, 0, 30, 30).fill('green');

        scene.addChild(g);
    },
};
