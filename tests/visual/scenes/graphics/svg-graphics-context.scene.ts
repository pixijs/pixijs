/* eslint-disable max-len */
import { Assets } from '../../../../src/assets/Assets';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { GraphicsContext } from '../../../../src/scene/graphics/shared/GraphicsContext';
import type { TestScene } from '../../types';

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
