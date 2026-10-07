import { RenderTexture } from '~/rendering';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../../types';
import type { Renderer } from '~/rendering';
import type { Container as ContainerType } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should write the same alpha for add and erase blend modes on a transparent texture',
    create: async (scene: ContainerType, renderer: Renderer) =>
    {
        const container = new Container();

        // left: half-alpha red, then half-alpha white added on top.
        // add must sum the alpha too, so this ends up almost opaque.
        const addBase = new Graphics().rect(0, 0, 64, 128).fill({ color: 0xff0000, alpha: 0.5 });
        const addTop = new Graphics().rect(0, 0, 64, 128).fill({ color: 0xffffff, alpha: 0.5 });

        addTop.blendMode = 'add';

        // right: opaque white with an opaque red eraser over the middle.
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
