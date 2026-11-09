import { RenderTexture } from '~/rendering';
import { Graphics, SmoothGraphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should cover edge pixels partially, where Graphics without MSAA does not',
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const draw = (g: Graphics) => g
            .circle(9, 9, 6)
            .stroke({ color: 0xffffff, width: 1.5 })
            .moveTo(2, 22)
            .lineTo(28, 29)
            .stroke({ color: 0xffffff, width: 1 })
            .poly([18, 2, 30, 6, 22, 15], true)
            .fill(0xffff00);

        // smooth on the left, aliased on the right, magnified twice
        const smooth = draw(new SmoothGraphics());
        const aliased = draw(new Graphics());

        aliased.x = 32;

        const texture = RenderTexture.create({ width: 64, height: 32, scaleMode: 'nearest' });

        renderer.render({ container: smooth, target: texture, clear: true, clearColor: [0, 0, 0, 1] });
        renderer.render({ container: aliased, target: texture, clear: false });

        const sprite = new Sprite(texture);

        sprite.scale.set(2);
        sprite.y = 32;

        scene.addChild(sprite);
    },
};
