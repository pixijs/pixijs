import { renderAsTileBased } from './renderAsTileBased';
import { RenderTexture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should keep earlier renders when an antialiased render texture is rendered to with clear: false',
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const target = RenderTexture.create({ width: 128, height: 128, antialias: true });

        const star = new Graphics().star(0, 0, 5, 40, 20).fill('red');
        const circle = new Graphics().circle(0, 0, 30).fill({ color: 'blue', alpha: 0.7 });
        const tri = new Graphics().poly([0, 0, 60, 20, 10, 50]).fill({ color: 'green', alpha: 0.7 });

        star.position.set(45, 45);
        circle.position.set(80, 70);
        tri.position.set(50, 60);

        renderAsTileBased(renderer, () =>
        {
            renderer.render({ container: star, target, clear: true });
            // each of these reopens the target and must see what was drawn before
            renderer.render({ container: circle, target, clear: false });
            renderer.render({ container: tri, target, clear: false });
        });

        scene.addChild(new Sprite(target));
    },
};
