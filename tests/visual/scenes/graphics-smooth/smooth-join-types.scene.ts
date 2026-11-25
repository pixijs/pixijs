import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render bevel, miter and round joins',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const joins = ['bevel', 'miter', 'round'] as const;
        const colors = [0xff0000, 0x00ff00, 0x0000ff];

        joins.forEach((join, i) =>
        {
            const g = new SmoothGraphics();

            g.moveTo(10, 34).lineTo(34, 8).lineTo(58, 34).stroke({ color: colors[i], width: 8, join });

            // a sharp angle falls back from miter to bevel past the miter limit
            g.moveTo(74, 34).lineTo(94, 6).lineTo(98, 34).stroke({ color: colors[i], width: 6, join });

            g.y = 4 + (i * 42);

            scene.addChild(g);
        });
    },
};
