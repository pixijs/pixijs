import { Graphics, TilingSprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should apply tilePosition in CSS pixel space for textures with resolution > 1',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const tileSize = 16;

        const source = new Graphics()
            .rect(0, 0, tileSize / 2, tileSize).fill(0xff2244)
            .rect(tileSize / 2, 0, tileSize / 2, tileSize)
            .fill(0x2288ff);

        const texture = renderer.generateTexture({ target: source, resolution: 2 });

        const baseline = new TilingSprite({ texture, width: 128, height: 64 });

        const shifted = new TilingSprite({
            texture,
            width: 128,
            height: 64,
            tilePosition: { x: tileSize / 2, y: 0 },
        });

        shifted.y = 64;

        scene.addChild(baseline, shifted);
    },
};
