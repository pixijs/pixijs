import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke join types: miter, round, bevel',
    create: async (scene: Container) =>
    {
        const joins = ['miter', 'round', 'bevel'] as const;
        const colors = [0xff0000, 0x00ff00, 0x0000ff];

        joins.forEach((join, i) =>
        {
            const g = new Graphics();
            const xOffset = i * 40;

            g.moveTo(10 + xOffset, 100)
                .lineTo(30 + xOffset, 20)
                .lineTo(50 + xOffset, 100)
                .stroke({
                    width: 10,
                    color: colors[i],
                    join,
                });

            scene.addChild(g);
        });
    },
};
