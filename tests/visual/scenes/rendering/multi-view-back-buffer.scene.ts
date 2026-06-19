import { Texture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

// With useBackBuffer enabled (WebGL), the renderer draws into a back-buffer texture and resolves it
// to the shared GL canvas. A secondary multiView canvas must still be presented from that GL canvas;
// before the fix it stayed blank. WebGPU has no back buffer and renders each canvas directly.
export const scene: TestScene = {
    it: 'should present secondary canvases while the back buffer is active',
    options: {
        multiView: true,
        useBackBuffer: true,
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

        const sceneA = new Graphics().circle(32, 32, 24).fill(0x00ff00);

        // a multiply-blended yellow overlay (yellow x blue = black) forces the back-buffer path and
        // leaves a visibly blended corner, so the snapshot proves the blend resolved through it
        const sceneB = new Graphics().rect(8, 8, 48, 48).fill(0x0000ff);
        const overlay = new Graphics().rect(8, 8, 28, 28).fill(0xffff00);

        overlay.blendMode = 'multiply';
        sceneB.addChild(overlay);

        renderer.render({ container: sceneA, target: canvasA, clearColor: 0x222222 });
        renderer.render({ container: sceneB, target: canvasB, clearColor: 0x222222 });

        // let the targets present before sampling them back into textures
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const spriteA = new Sprite(Texture.from(canvasA));
        const spriteB = new Sprite(Texture.from(canvasB));

        spriteB.position.set(64, 64);

        scene.addChild(spriteA);
        scene.addChild(spriteB);
    },
};
