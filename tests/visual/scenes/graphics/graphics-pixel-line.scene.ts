import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a pixel line correctly',
    create: async (scene: Container, _renderer: Renderer) =>
    {
        const graphics = new Graphics();

        graphics
            .moveTo(8, 0).lineTo(0, 8).moveTo(12, 20).lineTo(20, 12)
            .stroke({ color: 0, pixelLine: true })
            .rect(128 / 4, 128 / 4, 128 / 2, 128 / 2)
            .fill({ color: 0xff0000, alpha: 0.8 })
            .stroke({ color: 0xFFFFFF, pixelLine: true, alpha: 1 })
            .circle(128 / 2, 128 / 2, 128 / 2)
            .stroke({ color: 0x0, pixelLine: true, alpha: 0.5 });

        scene.addChild(graphics);

        const graphics2 = new Graphics();

        graphics2.context.batchMode = 'no-batch';

        graphics2
            .circle(128 / 2, 128 / 2, 128 / 3)
            .stroke({ color: 0x00FF00, pixelLine: true, alpha: 1 });

        scene.addChild(graphics, graphics2);
    },
};
