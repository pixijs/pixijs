import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should stretch a raw texture stroke to each shape\'s local bounds',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const g = new Graphics();

        g.rect(8, 8, 50, 50).stroke({ width: 12, texture, textureSpace: 'local' });
        g.circle(94, 94, 24).stroke({ width: 12, texture, textureSpace: 'local' });

        scene.addChild(g);
    },
};
