import { RenderTexture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../../types';
import type { Renderer } from '~/rendering';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should write the same alpha for add and erase blend modes on a transparent texture',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const container = new Container();

        // add must sum alpha too, so half-alpha white over half-alpha red ends almost opaque.
        const addBase = new Graphics().rect(0, 0, 64, 128).fill({ color: 0xff0000, alpha: 0.5 });
        const addTop = new Graphics().rect(0, 0, 64, 128).fill({ color: 0xffffff, alpha: 0.5 });

        addTop.blendMode = 'add';

        // erase must cut by the eraser's alpha, not its colour, so the hole is clear.
        const eraseBase = new Graphics().rect(64, 0, 64, 128).fill(0xffffff);
        const eraser = new Graphics().rect(80, 32, 32, 64).fill(0xff0000);

        eraser.blendMode = 'erase';

        container.addChild(addBase, addTop, eraseBase, eraser);

        const renderTexture = RenderTexture.create({ width: 128, height: 128 });

        renderer.render({ container, target: renderTexture, clearColor: [0, 0, 0, 0] });

        scene.addChild(new Sprite(renderTexture));
    },
};
