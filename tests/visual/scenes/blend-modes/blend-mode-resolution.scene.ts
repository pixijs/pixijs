import '~/advanced-blend-modes/init';
import '~/advanced-blend-modes';
import { Assets } from '~/assets';
import { type Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should inherit render target\'s resolution as the default for blend mode filters',
    options: {
        useBackBuffer: true,
        resolution: 1.6,
    },
    create: async (scene: Container) =>
    {
        const spriteTexture = await Assets.load('explosion_dxt5_mip.dds');
        const blendTexture = await Assets.load('chessboard.webp');

        const sprite = new Sprite({
            texture: spriteTexture,
            width: 100,
            height: 100,
            anchor: 0.5,
            position: { x: 100 / 2, y: 100 / 2 },
        });

        const sprite2 = new Sprite({
            texture: blendTexture,
            width: 100,
            height: 100,
            blendMode: 'overlay',
        });

        scene.addChild(sprite, sprite2);
    },
};
