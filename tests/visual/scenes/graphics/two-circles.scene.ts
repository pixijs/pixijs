import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should correctly swap bind groups and render to non batched circles with a sprite in the middle',
    pixelMatch: 200,
    only: true,
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
