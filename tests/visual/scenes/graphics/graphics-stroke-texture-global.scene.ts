import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should tile a raw texture stroke continuously in world space',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const g = new Graphics();

        g.rect(8, 8, 50, 50).stroke({ width: 12, texture, textureSpace: 'global' });
        g.rect(70, 70, 50, 50).stroke({ width: 12, texture, textureSpace: 'global' });

        scene.addChild(g);
    },
};
