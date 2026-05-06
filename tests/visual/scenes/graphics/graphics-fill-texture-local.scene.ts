import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should stretch a raw texture fill to each shape\'s bounds with textureSpace local',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const g = new Graphics();

        g.rect(10, 10, 108, 40).fill({ texture, textureSpace: 'local' });
        g.rect(10, 60, 40, 60).fill({ texture, textureSpace: 'local' });
        scene.addChild(g);
    },
};
