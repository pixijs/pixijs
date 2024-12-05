import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { Container, Graphics, TilingSprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should respect tiling sprite uvs',
    options: {
        width: 256,
        height: 128
    },
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);

        const makeTilingSprite = (x: number, y: number, uvRespectAnchor: boolean) =>
        {
            const parent = new Container();
            const bunny = new TilingSprite({ texture, width: 1, height: 1 });

            bunny.width = 100;
            bunny.height = 100;

            // Center the sprite's anchor point
            bunny.anchor.set(0.5);

            bunny.uvRespectAnchor = uvRespectAnchor;

            // Move the sprite to the center of the screen
            parent.x = x;
            parent.y = y;

            const bounds = bunny.getBounds();
            const rect = new Graphics()
                .rect(bounds.x, bounds.y, bounds.width, bounds.height)
                .stroke({
                    color: uvRespectAnchor ? 0xff0000 : 0x00ff00,
                    width: 1,
                    pixelLine: true
                })
                .closePath()
                .circle(uvRespectAnchor ? 0 : -50, uvRespectAnchor ? 0 : -50, 4)
                .fill(0xffffff)
                .stroke({
                    color: uvRespectAnchor ? 0xff0000 : 0x00ff00,
                    width: 1,
                    pixelLine: true
                });

            parent.addChild(bunny, rect);
            scene.addChild(parent);

            return bunny;
        };

        makeTilingSprite(64, 64, true);
        makeTilingSprite(256 - 64, 64, false);
    },
};
