import { Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render scenes to multiple target canvases',
    options: {
        multiView: true,
        width: 128,
        height: 128,
    },
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const canvasA = document.createElement('canvas');
        const canvasB = document.createElement('canvas');

        canvasA.width = canvasA.height = 64;
        canvasB.width = canvasB.height = 64;

        const sceneA = new Graphics().circle(32, 32, 24).fill(0xff0000);
        const sceneB = new Graphics().rect(16, 16, 32, 32).fill(0x0000ff);

        renderer.render({ container: sceneA, target: canvasA, clearColor: 0x333333 });
        renderer.render({ container: sceneB, target: canvasB, clearColor: 0xffff00 });

        // let the targets present before sampling them back into textures
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const spriteA = new Sprite(Texture.from(canvasA));
        const spriteB = new Sprite(Texture.from(canvasB));

        spriteB.position.set(64, 64);

        scene.addChild(spriteA);
        scene.addChild(spriteB);
    },
};
