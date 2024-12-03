import { Assets } from '~/assets/Assets';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render sprite',
    create: async (scene: Container) =>
    {
        const textures = await Assets.load([
            `bunny.png`,
        ]);

        const texture = textures[`bunny.png`];

        const sprite = new Sprite({
            texture: Texture.WHITE,
            width: 128,
            height: 128,
        });

        sprite.texture = texture;

        scene.addChild(sprite);
    },
};
