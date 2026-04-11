import { RenderTexture } from '~/rendering'
import { SmoothGraphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering'
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render circle',
    pixelMatch: 40,
    create: async (scene: Container, renderer: Renderer) =>
    {
        const rt = RenderTexture.create({ width: 100, height: 100, scaleMode: 'nearest' });

        const g = new SmoothGraphics();

        // Filled + stroked circle
        g.circle(15, 15, 10)
            // .fill({ color: 0x00ff00 })
            .stroke({ color: 0xffffff, width: 4 });        

        renderer.render({
            target: rt,
            container: g
        });

        const sprite = new Sprite(rt)
        sprite.scale.set(4, 4)

        scene.addChild(sprite);
    },
};
