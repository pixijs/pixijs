import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

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
