import { Matrix } from '~/maths';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render chamferRect with rotation transform',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        const x = 24;
        const y = 24;
        const width = 80;
        const height = 80;
        const cx = x + (width / 2);
        const cy = y + (height / 2);

        const transform = new Matrix();

        transform.translate(-cx, -cy);
        transform.rotate(Math.PI / 6);
        transform.translate(cx, cy);

        g.chamferRect(x, y, width, height, 14, transform).fill(0xff9933);

        scene.addChild(g);
    },
};
