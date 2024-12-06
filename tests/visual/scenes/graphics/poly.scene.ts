import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render polygon correctly',
    create: async (scene: Container) =>
    {
        const poly = new Graphics();

        poly.poly([{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }]);
        poly.fill(0x0000ff);

        poly.position.set(128 / 2);

        scene.addChild(poly);
    },
};
