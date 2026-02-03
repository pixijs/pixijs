import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render bunny when root container is visible (control test for GitHub Issue #11122)',
    create: async (scene: Container) =>
    {
        // Same setup as invisible test, but with scene visible
        const bunnyTexture = await Assets.load('bunny.png');

        const bunny = new Sprite(bunnyTexture);

        bunny.anchor.set(0.5);
        bunny.x = 50;
        bunny.y = 50;

        scene.addChild(bunny);

        // Control case: scene is visible - bunny should appear
        scene.visible = true;
    },
};
