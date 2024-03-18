/* eslint-disable max-len */
import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render mipmapped texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load<Texture>('bunny.png');

        texture.source.autoGenerateMipmaps = true;

        const sprite = new Sprite({
            texture,
            anchor: { x: 0.5, y: 0.5 }
        });

        sprite.scale.set(0.5);
        sprite.position.set(128 / 2);

        scene.addChild(sprite);
    },
};
