import { Assets } from '~/assets';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should tile pattern stroke continuously across multiple shapes with global textureSpace',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'global' });

        const g = new Graphics();

        g.rect(8, 8, 50, 50).stroke({ width: 12, fill: pattern });
        g.rect(70, 70, 50, 50).stroke({ width: 12, fill: pattern });

        scene.addChild(g);
    },
};
