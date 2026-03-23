import { SmoothGraphics } from '~/scene/graphics-smooth';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render bevel, miter, and round joins',
    pixelMatch: 40,
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const bevel = new SmoothGraphics();

        bevel.moveTo(10, 30).lineTo(30, 5).lineTo(50, 30)
            .stroke({ color: 0xff0000, width: 4, join: 'bevel' });

        const miter = new SmoothGraphics();

        miter.moveTo(10, 30).lineTo(30, 5).lineTo(50, 30)
            .stroke({ color: 0x00ff00, width: 4, join: 'miter' });
        miter.y = 35;

        const round = new SmoothGraphics();

        round.moveTo(10, 30).lineTo(30, 5).lineTo(50, 30)
            .stroke({ color: 0x0000ff, width: 4, join: 'round' });
        round.y = 70;

        scene.addChild(bevel, miter, round);
    },
};
