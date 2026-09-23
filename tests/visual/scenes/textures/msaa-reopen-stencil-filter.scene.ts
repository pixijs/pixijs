import { AlphaFilter } from '~/filters';
import { RenderTexture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';

export const scene: TestScene = {
    it: 'should keep a stencil mask active across a filtered child in an antialiased render texture',
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = RenderTexture.create({ width: 128, height: 128, antialias: true });
        const root = new Container();
        const masked = new Container();

        masked.addChild(new Graphics().rect(0, 0, 128, 128).fill('yellow'));

        const filtered = new Graphics().rect(20, 20, 88, 40).fill('red');

        filtered.filters = [new AlphaFilter({ alpha: 0.8 })];
        masked.addChild(filtered);

        // drawn after the filter's pop-back: still has to be clipped by the stencil mask
        masked.addChild(new Graphics().rect(0, 70, 128, 30).fill('blue'));

        const mask = new Graphics().star(64, 64, 5, 60, 30).fill('white');

        masked.mask = mask;
        root.addChild(masked, mask);

        renderer.render({ container: root, target, clear: true });

        scene.addChild(new Sprite(target));
    },
};
