import { Assets } from '~/assets';
import { Texture } from '~/rendering';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

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
