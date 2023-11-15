import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should cut holes',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill('red')
            .rect(60, 60, 30, 30)
            .cut()
            .rect(10, 10, 30, 30)
            .cut();

        const rect2 = new Graphics()
            .rect(0, 0, 100, 100)
            .fill('green')
            .rect(60, 60, 30, 30)
            .rect(10, 10, 30, 30)
            .cut();

        rect.scale.set(0.6);
        rect2.scale.set(0.6);
        rect2.position.set(60, 60);
        scene.addChild(rect);
        scene.addChild(rect2);
    },
};
