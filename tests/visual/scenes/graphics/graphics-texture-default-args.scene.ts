import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render texture with default arguments',
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');

        const g = new Graphics();

        g.texture(bunnyTexture);

        scene.addChild(g);
    },
};
