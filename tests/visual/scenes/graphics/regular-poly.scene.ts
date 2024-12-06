import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render regularPoly correctly',
    create: async (scene: Container) =>
    {
        const poly = new Graphics();

        poly.regularPoly(0, 0, 40, 6);
        poly.stroke({ color: 0xff0000, width: 16 });
        poly.fill(0x0000ff);

        poly.position.set(128 / 2);

        scene.addChild(poly);
    },
};
