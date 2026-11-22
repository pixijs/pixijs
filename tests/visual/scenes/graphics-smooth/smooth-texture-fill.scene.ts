import { Assets } from '~/assets';
import { FillGradient, FillPattern, SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should fill and stroke with textures, gradients and patterns',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const gradient = new FillGradient({
            end: { x: 1, y: 1 },
            colorStops: [{ offset: 0, color: 0xff0000 }, { offset: 1, color: 0x0000ff }],
        });
        const pattern = new FillPattern(texture, 'repeat');

        const g = new SmoothGraphics();

        g.circle(32, 32, 26).fill({ texture, textureSpace: 'local' });
        g.roundRect(70, 8, 50, 50, 12).fill(gradient);
        g.rect(8, 70, 50, 50).fill(pattern).stroke({ width: 6, fill: gradient });
        g.texture(texture, 0xffffff, 74, 72, 40, 46);

        // plain colors in the same context
        g.moveTo(66, 66).lineTo(122, 122).stroke({ color: 0xffff00, width: 3 });

        scene.addChild(g);
    },
};
