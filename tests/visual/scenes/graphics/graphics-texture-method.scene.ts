import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render texture with tint',
    create: async (scene: Container) =>
    {
        const bunnyTexture = await Assets.load('bunny.png');

        const g = new Graphics();

        // texture(texture, tint, x, y, width, height)
        g.texture(bunnyTexture, 0xFFFFFF, 0, 0, 60, 60); // normal
        g.texture(bunnyTexture, 0xFF0000, 64, 0, 60, 60); // red tint
        g.texture(bunnyTexture, 0x00FF00, 0, 64, 60, 60); // green tint
        g.texture(bunnyTexture, 0x0000FF, 64, 64, 60, 60); // blue tint

        scene.addChild(g);
    },
};
