import { Assets } from '~/assets';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should map local pattern to each shape\'s own bounds across geometries',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'local' });

        const g = new Graphics();

        g.rect(4, 34, 56, 56).fill({ fill: pattern });
        g.circle(96, 62, 30).fill({ fill: pattern });
        scene.addChild(g);
    },
};
