import { Assets } from '~/assets/Assets';
import { Sprite } from '~/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render no-premultiply-alpha',
    create: async (scene: Container) =>
    {
        const circleTexture = await Assets.load({
            src: 'blurredCircle.png',
            data: {
                alphaMode: 'no-premultiply-alpha'
            }
        });

        const sprite = new Sprite(circleTexture);

        scene.addChild(sprite);
    },
};
