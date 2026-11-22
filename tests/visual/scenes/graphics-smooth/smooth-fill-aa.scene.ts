import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should anti-alias the edges of convex and concave fills',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        // convex
        g.poly([22, 6, 6, 48, 40, 48], true).fill(0xff0000);
        g.regularPoly(84, 28, 22, 5, 0.3).fill(0x00ff00);

        // concave
        g.star(30, 90, 6, 26, 10).fill(0x0000ff);
        g.poly([66, 66, 122, 70, 96, 92, 120, 122, 64, 116], true).fill(0xffff00);

        scene.addChild(g);
    },
};
