import { Assets } from '~/assets';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should not render when root container (stage) is invisible - GitHub Issue #11122',
    create: async (scene: Container) =>
    {
        // Load the actual bunny texture used in the original playground example
        const bunnyTexture = await Assets.load('bunny.png');

        // Create the bunny sprite exactly like in the playground
        const bunny = new Sprite(bunnyTexture);

        bunny.anchor.set(0.5);
        bunny.x = 50;
        bunny.y = 50;

        scene.addChild(bunny);

        // This is the key test: setting the root container (scene) to invisible
        scene.visible = false;
    },
};
