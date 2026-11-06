import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should align strokes inside, centered and outside, for any winding',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const alignments = [1, 0.5, 0];

        alignments.forEach((alignment, i) =>
        {
            const x = 8 + (i * 40);
            const g = new SmoothGraphics();

            // clockwise
            g.rect(x, 10, 30, 30).fill(0x333333).stroke({ color: 0xff0000, width: 8, alignment });

            // counterclockwise
            g.poly([x, 60, x, 90, x + 30, 90, x + 30, 60], true)
                .fill(0x333333)
                .stroke({ color: 0x00ff00, width: 8, alignment });

            g.circle(x + 15, 110, 10).fill(0x333333).stroke({ color: 0xffff00, width: 6, alignment });

            scene.addChild(g);
        });
    },
};
