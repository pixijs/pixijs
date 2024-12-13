import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render rect',
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');

        const rect = new Graphics()
            .texture(bunnyTexture, 0, 0, 0, 100, 50)
            .texture(bunnyTexture, 0xFF0000, 0, 50, 100, 50)
            .texture(bunnyTexture, 0xFFFFFF, 0, 100, 100, 50);

        scene.addChild(rect);
    },
};
