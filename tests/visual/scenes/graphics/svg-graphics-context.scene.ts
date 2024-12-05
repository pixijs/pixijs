import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container, GraphicsContext } from '~/scene';

export const scene: TestScene = {
    it: 'should render svg a GraphicsContext texture',
    create: async (scene: Container) =>
    {
        const context = await Assets.load<GraphicsContext>({ src: 'logo.svg', data: { parseAsGraphicsContext: true } });

        const graphics = new Graphics(context);

        graphics.width = 128;
        graphics.height = 128;

        scene.addChild(graphics);
    },
};
