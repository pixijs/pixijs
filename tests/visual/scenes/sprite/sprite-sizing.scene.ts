import { Assets } from '../../../../src/assets/Assets';
import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sprite',
    pixelMatch: 200,
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
