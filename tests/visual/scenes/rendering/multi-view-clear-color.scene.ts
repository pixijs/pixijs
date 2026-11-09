import { Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

// A per-view clearColor of 0x000000 (the value 0) must clear to opaque black, not be skipped as a
// falsy value. The secondary canvas is cleared black and shows only its bright shape; the renderer
// background (red) must not bleed through.
export const scene: TestScene = {
    it: 'should clear a secondary canvas to black when clearColor is 0x000000',
    options: {
        multiView: true,
        width: 128,
        height: 128,
        background: 0xff0000,
    },
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const canvasA = document.createElement('canvas');
        const canvasB = document.createElement('canvas');

        canvasA.width = canvasA.height = 64;
        canvasB.width = canvasB.height = 64;

        const sceneA = new Graphics().circle(32, 32, 24).fill(0xffffff);
        const sceneB = new Graphics().circle(32, 32, 18).fill(0x00ffff);

        // canvasA keeps the renderer red background; canvasB is explicitly cleared to black
        renderer.render({ container: sceneA, target: canvasA });
        renderer.render({ container: sceneB, target: canvasB, clearColor: 0x000000 });

        // let the targets present before sampling them back into textures
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const spriteA = new Sprite(Texture.from(canvasA));
        const spriteB = new Sprite(Texture.from(canvasB));

        spriteB.position.set(64, 64);

        scene.addChild(spriteA);
        scene.addChild(spriteB);
    },
};
