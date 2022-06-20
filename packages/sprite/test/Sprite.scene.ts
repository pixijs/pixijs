import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import type { TestScene } from '../../../test/renderTests';

export const scene: TestScene = {
    it: 'should render a grid of bunnies with a tint',
    create: async (scene: Container) =>
    {
        const tex = await Texture.fromURL('https://pixijs.io/examples/examples/assets/bunny.png');
        const tints = [0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF];

        // Create a 5x5 grid of bunnies
        for (let i = 0; i < 25; i++)
        {
            const bunny = Sprite.from(tex);

            bunny.x = (i % 5) * 115;
            bunny.y = Math.floor(i / 5) * 115;
            bunny.tint = tints[i % tints.length];
            scene.addChild(bunny);
        }
    },
};
