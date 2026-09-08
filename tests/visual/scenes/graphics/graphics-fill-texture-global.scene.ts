import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should tile a raw texture fill in world space across multiple shapes with textureSpace global',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const g = new Graphics();

        g.rect(10, 10, 108, 40).fill({ texture, textureSpace: 'global' });
        g.rect(10, 60, 40, 60).fill({ texture, textureSpace: 'global' });
        scene.addChild(g);
    },
};
