import { ColorTransformFilter } from '~/filters';
import { type Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    excludeRenderers: ['canvas', 'webgpu'],
    it: 'Color Matrix filter multiply flag should not affect matrix if it is the only matrix applied',
    create: async (scene: Container) =>
    {
        const createRectangle = ({ x, y }: {x: number, y: number}): [Graphics, ColorTransformFilter] =>
        {
            const rect = new Graphics().rect(x * 32, y * 32, 32, 32).fill('orange');
            const filter = new ColorTransformFilter();

            rect.filters = [filter];

            return [rect, filter];
        };

        const [rect1, filter1] = createRectangle({ x: 0, y: 0 });

        filter1.brightness(1, false);

        const [rect2, filter2] = createRectangle({ x: 1, y: 0 });

        filter2.contrast(0, false);

        const [rect3, filter3] = createRectangle({ x: 2, y: 0 });

        filter3.brightness(1, false);
        filter3.contrast(0, false);

        const [rect4, filter4] = createRectangle({ x: 3, y: 0 });

        filter4.contrast(0, false);
        filter4.brightness(1, false);

        const [rect5, filter5] = createRectangle({ x: 0, y: 1 });

        filter5.brightness(1, true);

        const [rect6, filter6] = createRectangle({ x: 1, y: 1 });

        filter6.contrast(0, true);

        const [rect7, filter7] = createRectangle({ x: 2, y: 1 });

        filter7.brightness(1, true);
        filter7.contrast(0, true);

        const [rect8, filter8] = createRectangle({ x: 3, y: 1 });

        filter8.contrast(0, true);
        filter8.brightness(1, true);

        const [rect9, filter9] = createRectangle({ x: 0, y: 2 });

        filter9.technicolor(false);

        const [rect10, filter10] = createRectangle({ x: 1, y: 2 });

        filter10.kodachrome(false);

        const [rect11, filter11] = createRectangle({ x: 2, y: 2 });

        filter11.browni(false);

        const [rect12, filter12] = createRectangle({ x: 3, y: 2 });

        filter12.vintage(false);

        const [rect13, filter13] = createRectangle({ x: 0, y: 3 });

        filter13.technicolor(true);

        const [rect14, filter14] = createRectangle({ x: 1, y: 3 });

        filter14.kodachrome(true);

        const [rect15, filter15] = createRectangle({ x: 2, y: 3 });

        filter15.browni(true);

        const [rect16, filter16] = createRectangle({ x: 3, y: 3 });

        filter16.vintage(true);

        scene.addChild(
            rect1, rect2, rect3, rect4,
            rect5, rect6, rect7, rect8,
            rect9, rect10, rect11, rect12,
            rect13, rect14, rect15, rect16,
        );
    },
};
