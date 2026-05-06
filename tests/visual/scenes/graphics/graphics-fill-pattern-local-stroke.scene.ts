import { Assets } from '~/assets';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke pattern fitted to local stroke bounds',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'local' });

        const g = new Graphics();

        g.rect(14, 14, 100, 100).stroke({ width: 12, fill: pattern });
        scene.addChild(g);
    },
};
