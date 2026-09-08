import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render miter limit: high (long point) vs low (beveled)',
    create: async (scene: Container) =>
    {
        const limits = [10, 1];
        const colors = [0xff0000, 0x0000ff];

        limits.forEach((miterLimit, i) =>
        {
            const g = new Graphics();
            const xOffset = i * 60;

            g.moveTo(10 + xOffset, 100)
                .lineTo(40 + xOffset, 20)
                .lineTo(70 + xOffset, 100)
                .stroke({
                    width: 10,
                    color: colors[i],
                    join: 'miter',
                    miterLimit,
                });

            scene.addChild(g);
        });
    },
};
