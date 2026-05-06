import { Assets } from '~/assets';
import { Matrix } from '~/maths';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render pattern with translate transform',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern(texture, 'repeat');

        const matrix = new Matrix();

        matrix.translate(20, 10);
        pattern.setTransform(matrix);

        const g = new Graphics();

        g.rect(0, 0, 128, 128).fill({ fill: pattern });
        scene.addChild(g);
    },
};
