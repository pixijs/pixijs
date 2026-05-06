import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render texture at natural size with offset',
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');

        const g = new Graphics();

        g.texture(bunnyTexture, 0xffffff, 30, 40);
        g.texture(bunnyTexture, 0xffffff, 70, 80);

        scene.addChild(g);
    },
};
