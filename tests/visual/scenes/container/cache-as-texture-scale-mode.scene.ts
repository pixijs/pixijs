import { Assets } from '~/assets';
import { type SCALE_MODE } from '~/rendering';
import { Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render cache as texture respecting scaleMode',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const scaleModes: SCALE_MODE[] = ['linear', 'nearest'];

        for (const scaleMode of scaleModes)
        {
            const root = new Container({ scale: 2 });
            const bunny = new Sprite(texture);

            root.addChild(bunny);
            root.cacheAsTexture({ scaleMode });
            root.x = scene.children.length * 60;

            scene.addChild(root);
        }
    }
};
