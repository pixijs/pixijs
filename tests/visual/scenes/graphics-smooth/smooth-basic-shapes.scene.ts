import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render basic shapes with smooth edges',
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        g.rect(6, 6, 50, 30).fill(0xff0000).stroke({ color: 0xffffff, width: 2 });
        g.circle(92, 22, 18).fill(0x00ff00).stroke({ color: 0xffffff, width: 2 });
        g.ellipse(32, 62, 26, 14).fill(0x0000ff).stroke({ color: 0xffffff, width: 2 });
        g.roundRect(68, 46, 52, 34, 8).fill(0xffff00).stroke({ color: 0xffffff, width: 2 });
        g.poly([10, 120, 32, 88, 54, 120], true).fill(0xff00ff).stroke({ color: 0xffffff, width: 2 });
        g.star(94, 104, 5, 22, 10).fill(0x00ffff).stroke({ color: 0xffffff, width: 2 });

        scene.addChild(g);
    },
};
