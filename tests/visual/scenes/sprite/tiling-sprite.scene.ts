import { Assets } from '../../../../src/assets/Assets';
import { TilingSprite } from '../../../../src/scene/sprite-tiling/TilingSprite';
import { basePath } from '../../../assets/basePath';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
