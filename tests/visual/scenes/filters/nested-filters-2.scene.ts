import { Assets } from '~/assets';
import { ColorMatrixFilter } from '~/filters';
import { Container, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render nested filters correctly with proper positioning',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const container = new Container();

        scene.addChild(container);

        const texture = await Assets.load(`bunny.png`);

        // Create a 5x5 grid of bunnies with nested filters
        for (let i = 0; i < 25; i++)
        {
            const bunny = new Sprite(texture);
            const subcont = new Container();

            bunny.scale.set(1);
            bunny.x = (i % 5) * 20;
            bunny.y = Math.floor(i / 5) * 20;

            subcont.addChild(bunny);
            container.addChild(subcont);

            // Half of the bunnies get a nested filter
            if (i % 2 === 0)
            {
                const nestedFilter = new ColorMatrixFilter();

                nestedFilter.hue(90, true);
                subcont.filters = [nestedFilter];
            }
        }

        // Center the container in the 128x128 square
        container.x = 64;
        container.y = 64;
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;

        // Apply the main filter that was causing positioning issues
        container.filters = [new ColorMatrixFilter({})];
    },
};
