import { Assets } from '~/assets';
import { Point } from '~/maths';
import { Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render alpha mask with cache as texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const bunny = new Sprite({
            texture,
            anchor: 0.5,
            position: new Point(128 / 2, 128 / 2),
            scale: 4,
        });

        const maskBunny = new Sprite({
            texture,
            anchor: 0.5,
            position: new Point(128 / 2, 128 / 2),
            rotation: Math.PI / 2,
            scale: 4,
        });

        const container = new Container();

        container.addChild(bunny, maskBunny);

        container.cacheAsTexture(true);

        bunny.mask = maskBunny;
        scene.addChild(container);
    },
};
