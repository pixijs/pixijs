import { DashLineShader, SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render dashed lines with DashLineShader',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        g.context.customShader = new DashLineShader({ dash: 8, gap: 5 });

        g.moveTo(10, 16).lineTo(118, 16).stroke({ color: 0xff0000, width: 4 });
        g.moveTo(10, 36).lineTo(118, 66).stroke({ color: 0x00ff00, width: 3 });
        g.circle(36, 96, 22).stroke({ color: 0xffffff, width: 2 });
        g.moveTo(70, 80).lineTo(118, 80).lineTo(94, 120).closePath()
            .stroke({ color: 0xffff00, width: 3 });

        scene.addChild(g);
    },
};
