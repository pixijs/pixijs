import { Assets } from '@/assets/Assets';
import { Sprite } from '@/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';

export const scene: TestScene = {
    it: 'should render premultiply-alpha correctly',
    create: async (scene: Container) =>
    {
        // Load the bunny texture
        const texture = await Assets.load({
            src: 'cloud-pot-pma.png',
            data: {
                alphaMode: 'premultiplied-alpha'
            }
        });

        scene.addChild(new Sprite(texture));
    },
};
