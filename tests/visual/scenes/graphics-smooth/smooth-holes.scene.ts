import { SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should cut and stroke holes',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const g = new SmoothGraphics();

        g.rect(8, 8, 52, 52).fill(0xff0000).circle(34, 34, 14).cut();
        g.circle(94, 34, 26).fill(0x00ff00).poly([94, 18, 108, 46, 80, 46], true).cut();

        // the first cut() goes to the stroke, the second one to the fill under it
        const drawHoles = () => g.rect(20, 84, 20, 24).rect(54, 84, 20, 24).circle(98, 96, 12);

        g.roundRect(8, 72, 112, 48, 10).fill(0x0000ff).stroke({ color: 0xffffff, width: 2 });
        drawHoles().cut();
        drawHoles().cut();

        scene.addChild(g);
    },
};
