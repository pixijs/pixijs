import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container, GraphicsContext } from '~/scene';

export const scene: TestScene = {
    it: 'should fill a self-intersecting pentagram with nonzero rule',
    create: async (scene: Container) =>
    {
        const context = await Assets.load<GraphicsContext>({
            src: 'svg-issue-7325-pentagram.svg',
            data: { parseAsGraphicsContext: true }
        });

        const graphics = new Graphics(context);

        graphics.width = 128;
        graphics.height = 128;

        scene.addChild(graphics);
    },
};
