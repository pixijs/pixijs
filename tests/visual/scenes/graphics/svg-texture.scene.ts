/* eslint-disable max-len */
import { Assets } from '@/assets/Assets';
import { Sprite } from '@/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Texture } from '@/rendering/renderers/shared/texture/Texture';
import type { Container } from '@/scene/container/Container';

export const scene: TestScene = {
    it: 'should render svg as texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load<Texture>('logo.svg');

        const sprite = new Sprite(texture);

        sprite.width = 128;
        sprite.height = 128;

        scene.addChild(sprite);
    },
};
