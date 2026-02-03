import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render regular/rounded polygons, fillet/chamfer rects',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .roundPoly(20, 20, 20, 5, 4)
            .regularPoly(80, 20, 20, 5)
            .filletRect(5, 100, 25, 25, 16)
            .chamferRect(50, 100, 25, 25, 8)
            .fill('red');

        scene.addChild(rect);
    },
};
