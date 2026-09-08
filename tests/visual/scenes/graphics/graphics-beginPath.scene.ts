import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should reset path state with beginPath between fills',
    create: async (scene: Container) =>
    {
        const g = new Graphics();

        g.moveTo(20, 20)
            .lineTo(60, 20)
            .lineTo(60, 60)
            .lineTo(20, 60)
            .closePath()
            .fill(0xff5533);

        g.beginPath();

        g.moveTo(70, 70)
            .lineTo(110, 70)
            .lineTo(110, 110)
            .lineTo(70, 110)
            .closePath()
            .fill(0x33cc66);

        scene.addChild(g);
    },
};
