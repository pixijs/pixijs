import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { blurredCircle } from './blurredCircle';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    only: true,
    it: 'should render alpha from a Color',
    create: async (scene: Container) =>
    {
        const circleTexture = await Assets.load({
            src: blurredCircle,
            data: {
                alphaMode: 'no-premultiply-alpha'
            }
        });

        const sprite = new Sprite(circleTexture);

        scene.addChild(sprite);
    },
};
