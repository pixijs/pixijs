/* eslint-disable max-len */
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render regularPoly correctly',
    only: true,
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
