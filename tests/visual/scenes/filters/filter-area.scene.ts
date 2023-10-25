import { ColorMatrixFilter } from '../../../../src/filters/defaults/color-matrix/ColorMatrixFilter';
import { Rectangle } from '../../../../src/maths/shapes/Rectangle';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'Filter Area should be applied correctly',
    create: async (scene: Container) =>
    {
        const rect = new Graphics().rect(0, 0, 100, 100).fill('orange');

        rect.filterArea = new Rectangle(50, 50, 50, 50);

        const filter = new ColorMatrixFilter();

        filter.hue(90, true);

        rect.filters = [filter];
        rect.x = 30;

        scene.addChild(rect);
    },
};
