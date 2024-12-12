import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should correctly swap bind groups and render to non batched circles with a sprite in the middle',
    create: async (scene: Container) =>
    {
        const createGraphics = () =>
            new Graphics()
                .circle(0, 0, 50 / 2)
                .fill('blue')
                .stroke({ width: 10, color: 'red', alignment: 0 });

        const graphics1 = createGraphics();

        graphics1.position.set(50);
        scene.addChild(graphics1);

        scene.addChild(new Sprite()); // <-- Empty Texture

        const graphics2 = createGraphics();

        graphics2.position.set(128 - 50);
        scene.addChild(graphics2);
    },
};
