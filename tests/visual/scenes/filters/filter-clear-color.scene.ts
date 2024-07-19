import { AlphaFilter } from '../../../../src/filters/defaults/alpha/AlphaFilter';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'Filter Clear Color should be applied correctly',
    create: async (scene: Container) =>
    {
        const circle = new Graphics().circle(50, 50, 50).fill('red');

        circle.filterClearColor = 'green';

        const filter = new AlphaFilter();

        circle.filters = [filter];

        scene.addChild(circle);
    },
};
