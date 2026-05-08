import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render strokes with alignment values outside [0..1]',
    create: async (scene: Container) =>
    {
        const circle = new Graphics()
            .circle(36, 36, 20)
            .fill(0xffcc00)
            .stroke({
                width: 10,
                color: 0x0000ff,
                alignment: -1,
            });

        scene.addChild(circle);

        const poly = new Graphics()
            .regularPoly(92, 92, 24, 6)
            .fill(0xffcc00)
            .stroke({
                width: 10,
                color: 0xff0066,
                alignment: 2,
            });

        scene.addChild(poly);
    },
};
