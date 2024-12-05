import { basePath } from '@test-utils';
import { Assets } from '~/assets/Assets';
import { TilingSprite } from '~/scene/sprite-tiling/TilingSprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render tiling sprite',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);
        const sprite = new TilingSprite({
            texture,
            width: 100,
            height: 50,
        });

        const spriteBlend = new TilingSprite({
            texture,
            width: 100,
            height: 50,
            blendMode: 'screen'
        });

        spriteBlend.y = 50;

        scene.addChild(sprite);
        scene.addChild(spriteBlend);
    },
};
