import { Assets } from '~/assets';
import { Matrix } from '~/maths';
import { Graphics } from '~/scene';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render pattern with skew transform',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const pattern = new FillPattern(texture, 'repeat');

        const matrix = new Matrix();

        matrix.set(1, 0, 0.5, 1, 0, 0);
        pattern.setTransform(matrix);

        const g = new Graphics();

        g.rect(0, 0, 128, 128).fill({ fill: pattern });
        scene.addChild(g);
    },
};
