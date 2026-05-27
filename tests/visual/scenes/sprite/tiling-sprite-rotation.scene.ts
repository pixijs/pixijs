import { basePath } from '@test-utils';
import { Assets } from '~/assets';
import { TilingSprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should rotate tile pattern consistently regardless of sprite aspect',
    options: {
        width: 310,
        height: 120,
    },
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);

        const square = new TilingSprite({
            texture,
            width: 100,
            height: 100,
            x: 10,
            y: 10,
            tileRotation: Math.PI / 4,
        });

        const wide = new TilingSprite({
            texture,
            width: 140,
            height: 50,
            x: 120,
            y: 10,
            tileRotation: Math.PI / 4,
        });

        const tall = new TilingSprite({
            texture,
            width: 30,
            height: 100,
            x: 270,
            y: 10,
            tileRotation: Math.PI / 4,
        });

        scene.addChild(square, wide, tall);
    },
};
