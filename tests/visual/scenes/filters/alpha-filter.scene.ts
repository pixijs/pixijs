import { AlphaFilter } from '~/filters';
import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'Alpha filter should be applied correctly',
    create: async (scene: Container) =>
    {
        const filterContainer = new Container();

        const rect = new Graphics().rect(0, 0, 100, 100).fill('orange');

        const rect2 = new Graphics().rect(50, 50, 100, 100).fill('orange');

        filterContainer.addChild(rect, rect2);

        const filter = new AlphaFilter({
            alpha: 0.5
        });

        filterContainer.filters = filter;

        scene.addChild(filterContainer);
    },
};
