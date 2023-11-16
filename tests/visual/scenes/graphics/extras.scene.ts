import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render rounded polygons, torus, fillet/chamfer rects',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .roundPoly(20, 20, 20, 5, 4)
            .torus(80, 20, 10, 20, 0, 6)
            .torus(50, 50, 10, 20)
            .filletRect(5, 100, 25, 25, 16)
            .chamferRect(50, 100, 25, 25, 8)
            .fill('red');

        scene.addChild(rect);
    },
};
