import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container, GraphicsContext } from '~/scene';

export const scene: TestScene = {
    it: 'should render Instagram icon SVG with holes (multiple paths, no fill-rule)',
    create: async (scene: Container) =>
    {
        const context = await Assets.load<GraphicsContext>({
            src: 'svg-icon-instagram.svg',
            data: { parseAsGraphicsContext: true }
        });

        const graphics = new Graphics(context);

        graphics.x = 10;
        graphics.y = 10;
        graphics.scale.set(5);

        scene.addChild(graphics);
    },
};

