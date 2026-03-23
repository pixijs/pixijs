import { SmoothGraphics } from '~/scene/graphics-smooth';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render basic shapes with smooth AA',
    pixelMatch: 40,
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        // Filled + stroked rect
        g.rect(4, 4, 50, 30)
            .fill({ color: 0xff0000 })
            .stroke({ color: 0xffffff, width: 2 });

        // Filled + stroked circle
        g.circle(90, 20, 18)
            .fill({ color: 0x00ff00 })
            .stroke({ color: 0xffffff, width: 2 });

        // Filled + stroked ellipse
        g.ellipse(30, 80, 24, 14)
            .fill({ color: 0x0000ff })
            .stroke({ color: 0xffffff, width: 2 });

        // Filled + stroked rounded rect
        g.roundRect(64, 58, 50, 34, 8)
            .fill({ color: 0xffff00 })
            .stroke({ color: 0xffffff, width: 2 });

        scene.addChild(g);
    },
};
