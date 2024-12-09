import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

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
