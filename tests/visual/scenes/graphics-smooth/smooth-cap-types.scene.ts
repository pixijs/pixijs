import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render butt, square, and round caps',
    pixelMatch: 40,
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const butt = new SmoothGraphics();

        butt.moveTo(10, 15).lineTo(118, 15)
            .stroke({ color: 0xff0000, width: 6, cap: 'butt' });

        const square = new SmoothGraphics();

        square.moveTo(10, 55).lineTo(118, 55)
            .stroke({ color: 0x00ff00, width: 6, cap: 'square' });

        const round = new SmoothGraphics();

        round.moveTo(10, 95).lineTo(118, 95)
            .stroke({ color: 0x0000ff, width: 6, cap: 'round' });

        scene.addChild(butt, square, round);
    },
};
