import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render butt, square and round caps',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        g.moveTo(20, 20).lineTo(108, 20).stroke({ color: 0xff0000, width: 12, cap: 'butt' });
        g.moveTo(20, 50).lineTo(108, 50).stroke({ color: 0x00ff00, width: 12, cap: 'square' });
        g.moveTo(20, 80).lineTo(108, 80).stroke({ color: 0x0000ff, width: 12, cap: 'round' });

        // the path line, to show where the caps start
        g.moveTo(20, 10).lineTo(20, 90).moveTo(108, 10).lineTo(108, 90)
            .stroke({ color: 0xffffff, width: 1 });

        // a diagonal line shows the caps aren't axis aligned
        g.moveTo(20, 118).lineTo(108, 100).stroke({ color: 0xffff00, width: 8, cap: 'round' });

        scene.addChild(g);
    },
};
