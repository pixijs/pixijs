import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container, GraphicsContext } from '~/scene';

export const scene: TestScene = {
    it: 'should render Twitter/X icon SVG (single path, no fill-rule)',
    create: async (scene: Container) =>
    {
        const context = await Assets.load<GraphicsContext>({
            src: 'svg-icon-twitter-x.svg',
            data: { parseAsGraphicsContext: true }
        });

        const graphics = new Graphics(context);

        graphics.x = 15;
        graphics.y = 15;
        graphics.scale.set(5);

        scene.addChild(graphics);
    },
};

