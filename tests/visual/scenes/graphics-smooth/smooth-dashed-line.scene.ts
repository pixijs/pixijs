import { DashLineShader, SmoothGraphics } from '~/scene/graphics-smooth';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render dashed lines using DashLineShader',
    pixelMatch: 40,
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const dashShader = new DashLineShader({ dash: 8, gap: 5 });
        const g = new SmoothGraphics();

        g.context.customShader = dashShader;

        // Horizontal dashed line
        g.moveTo(10, 20).lineTo(118, 20)
            .stroke({ color: 0xff0000, width: 3 });

        // Diagonal dashed line
        g.moveTo(10, 50).lineTo(118, 80)
            .stroke({ color: 0x00ff00, width: 3 });

        // Dashed circle outline
        g.circle(64, 100, 20)
            .stroke({ color: 0x0000ff, width: 2 });

        scene.addChild(g);
    },
};
