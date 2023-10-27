import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
