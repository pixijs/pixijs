import { Assets } from '~/assets';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render pattern with repeat-x mode',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern(texture, 'repeat-x');

        const g = new Graphics();

        g.rect(0, 0, 128, 128).fill({ fill: pattern });
        scene.addChild(g);
    },
};
