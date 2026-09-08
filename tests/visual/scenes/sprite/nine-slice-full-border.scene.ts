import { RenderTexture } from '~/rendering';
import { Graphics, NineSliceSprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a nine-slice sprite whose borders cover the whole texture',
    options: {
        width: 320,
        height: 160,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        // 240x240 texture: 4 coloured quadrants split by a white cross down the middle.
        const g = new Graphics();

        g.rect(0, 0, 120, 120).fill(0xff0000);
        g.rect(120, 0, 120, 120).fill(0x00ff00);
        g.rect(0, 120, 120, 120).fill(0x0000ff);
        g.rect(120, 120, 120, 120).fill(0xffff00);
        g.rect(116, 0, 8, 240).fill(0xffffff);
        g.rect(0, 116, 240, 8).fill(0xffffff);

        const rt = RenderTexture.create({ width: 240, height: 240 });

        renderer.render({ container: g, target: rt });

        // Borders sum to the full texture size, so the center source span collapses to 0.
        // The center (the stretched white cross) must still render instead of being dropped.
        const ns = new NineSliceSprite({
            texture: rt,
            leftWidth: 120,
            rightWidth: 120,
            topHeight: 120,
            bottomHeight: 120,
            width: 280,
            height: 112,
        });

        ns.position.set(20, 24);
        scene.addChild(ns);
    },
};
