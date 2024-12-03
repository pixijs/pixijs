import { ColorMatrixFilter } from '@/filters/defaults/color-matrix/ColorMatrixFilter';
import { Rectangle } from '@/maths/shapes/Rectangle';
import { Graphics } from '@/scene/graphics/shared/Graphics';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';

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
