import { renderAsTileBased } from './renderAsTileBased';
import { BlurFilter } from '~/filters';
import { RenderTexture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';

export const scene: TestScene = {
    it: 'should keep the content under a filtered child in an antialiased render texture',
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = RenderTexture.create({ width: 128, height: 128, antialias: true });
        const content = new Container();

        // drawn before the filter: the filter's pop-back reopens the target on top of this
        content.addChild(new Graphics().star(64, 64, 6, 60, 30).fill('orange'));

        const filtered = new Graphics().circle(64, 64, 28).fill('purple');

        filtered.filters = [new BlurFilter({ strength: 4 })];
        content.addChild(filtered);

        // drawn after the pop-back, in the reopened pass
        content.addChild(new Graphics().rect(20, 90, 88, 12).fill('teal'));

        renderAsTileBased(renderer, () => renderer.render({ container: content, target, clear: true }));

        scene.addChild(new Sprite(target));
    },
};
