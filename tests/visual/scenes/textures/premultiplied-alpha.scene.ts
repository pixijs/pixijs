import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
