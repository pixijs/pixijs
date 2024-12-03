/* eslint-disable max-len */
import { Assets } from '@/assets/Assets';
import { Graphics } from '@/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';
import type { GraphicsContext } from '@/scene/graphics/shared/GraphicsContext';

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
