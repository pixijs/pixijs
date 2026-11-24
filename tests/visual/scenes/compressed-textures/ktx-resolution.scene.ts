import '~/compressed-textures/ktx/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Texture } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render a compressed texture loaded at resolution 2 at half its pixel size',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load<Texture>({ src: 'test.bc3.mipmap.ktx', data: { resolution: 2 } });

        scene.addChild(new Sprite(texture));
    },
};
