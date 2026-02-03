import '~/compressed-textures/dds/init';
import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render compressed texture after context restore',
    create: async (scene: Container, renderer: Renderer) =>
    {
        if ('context' in renderer)
        {
            renderer.context?.forceContextLoss();
        }
        const texture = await Assets.load('explosion_dxt5_mip.dds');

        const sprite = new Sprite(texture);

        sprite.width = 128;
        sprite.height = 128;

        scene.addChild(sprite);
    },
};
