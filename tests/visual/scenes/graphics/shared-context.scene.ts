import { Graphics, GraphicsContext } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render graphics with shared context',
    create: async (scene: Container) =>
    {
        const context = new GraphicsContext();

        context
            .rect(10, 10, 32, 32)
            .fill({ color: 0xff0000 });

        const graphics1 = new Graphics(context);
        const graphics2 = new Graphics(context);
        const graphics3 = new Graphics(context);

        graphics2.position.set(32, 32);
        graphics3.position.set(64, 64);
        graphics3.tint = 0x00ff00;
        graphics3.scale.set(0.75);

        scene.addChild(graphics1);
        scene.addChild(graphics2);
        scene.addChild(graphics3);

        context
            .rect(10, 10, 32, 32)
            .stroke({ color: 0x0000ff, width: 2 });
    },
};
