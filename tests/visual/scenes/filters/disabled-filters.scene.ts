import { Assets } from '~/assets';
import { BlurFilter, ColorMatrixFilter } from '~/filters';
import { type Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should respect disabled filters',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`bunny.png`);
        const bunnies = 2;
        const padding = 12;
        const offsetX = (128 - (bunnies * texture.width) - ((bunnies - 1) * padding)) * 0.5;
        const offsetY = (128 - texture.height) * 0.5;

        for (let i = 0; i < 2; i++)
        {
            const sprite = new Sprite({ texture });
            const blurFilter = new BlurFilter({ strength: 5 });
            const colorMatrixFilter = new ColorMatrixFilter();

            colorMatrixFilter.hue(45, true);

            sprite.x = offsetX + (i * (texture.width + padding));
            sprite.y = offsetY;
            sprite.filters = [blurFilter, colorMatrixFilter];

            blurFilter.enabled = i % 2 === 0;
            colorMatrixFilter.enabled = i % 2 === 1;

            scene.addChild(sprite);
        }
    }
};
