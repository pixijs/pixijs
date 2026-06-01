import { Matrix } from '~/maths';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render regularPoly with rotation and matrix transform',
    create: async (scene: Container) =>
    {
        const base = new Graphics();

        base.regularPoly(32, 32, 20, 5).fill(0xff4466);

        const rotated = new Graphics();

        rotated.regularPoly(96, 32, 20, 5, Math.PI / 5).fill(0x44aaff);

        const transform = new Matrix();

        transform.translate(-64, -96);
        transform.scale(1.6, 0.8);
        transform.translate(64, 96);

        const transformed = new Graphics();

        transformed.regularPoly(64, 96, 20, 5, 0, transform).fill(0x66cc66);

        scene.addChild(base);
        scene.addChild(rotated);
        scene.addChild(transformed);
    },
};
