import { SmoothGraphics } from '~/scene/graphics-smooth';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render filled polygons with smooth AA edges',
    pixelMatch: 40,
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        // Triangle
        g.poly([20, 5, 5, 40, 35, 40], true)
            .fill({ color: 0xff0000 });

        // Pentagon
        const cx = 80;
        const cy = 25;
        const r = 20;
        const pts: number[] = [];

        for (let i = 0; i < 5; i++)
        {
            const a = ((i / 5) * Math.PI * 2) - (Math.PI / 2);

            pts.push(cx + (Math.cos(a) * r), cy + (Math.sin(a) * r));
        }
        g.poly(pts, true).fill({ color: 0x00ff00 });

        // Star (filled)
        g.star(30, 80, 5, 22, 10)
            .fill({ color: 0x0000ff });

        // Irregular quad
        g.poly([70, 55, 115, 60, 110, 100, 65, 95], true)
            .fill({ color: 0xffff00 });

        scene.addChild(g);
    },
};
