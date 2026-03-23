import { SmoothGraphics } from '~/scene/graphics-smooth';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render correctly under scale transforms',
    pixelMatch: 40,
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        // Unscaled reference
        const g1 = new SmoothGraphics();

        g1.circle(20, 20, 15)
            .stroke({ color: 0xff0000, width: 2 });
        g1.moveTo(5, 45).lineTo(35, 45)
            .stroke({ color: 0xff0000, width: 2 });
        scene.addChild(g1);

        // Uniform scale (2x)
        const g2 = new SmoothGraphics();

        g2.circle(20, 20, 15)
            .stroke({ color: 0x00ff00, width: 2 });
        g2.moveTo(5, 45).lineTo(35, 45)
            .stroke({ color: 0x00ff00, width: 2 });
        g2.scale.set(2);
        g2.x = 50;
        scene.addChild(g2);

        // Non-uniform scale
        const g3 = new SmoothGraphics();

        g3.circle(20, 20, 15)
            .stroke({ color: 0x0000ff, width: 2 });
        g3.moveTo(5, 45).lineTo(35, 45)
            .stroke({ color: 0x0000ff, width: 2 });
        g3.scale.set(1.5, 0.8);
        g3.y = 70;
        scene.addChild(g3);
    },
};
