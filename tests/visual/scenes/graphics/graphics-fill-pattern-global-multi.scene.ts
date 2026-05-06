import { Assets } from '~/assets';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should tile pattern continuously across multiple shapes with global textureSpace',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern({ texture, repetition: 'repeat', textureSpace: 'global' });

        const g = new Graphics();

        g.rect(0, 0, 60, 60).fill({ fill: pattern });
        g.rect(64, 64, 60, 60).fill({ fill: pattern });
        scene.addChild(g);
    },
};
