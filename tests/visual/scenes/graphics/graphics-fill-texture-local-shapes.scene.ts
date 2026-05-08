import { Assets } from '~/assets';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should stretch a raw texture fill to the bounds of differing shape types with textureSpace local',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const g = new Graphics();

        g.rect(8, 8, 50, 36).fill({ texture, textureSpace: 'local' });
        g.circle(94, 26, 22).fill({ texture, textureSpace: 'local' });
        g.poly([8, 120, 64, 60, 120, 120]).fill({ texture, textureSpace: 'local' });
        scene.addChild(g);
    },
};
