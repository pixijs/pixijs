import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render arc with clockwise vs counterclockwise sweep',
    create: async (scene: Container) =>
    {
        const start = 0;
        const end = Math.PI * 0.75;

        const cw = new Graphics();

        cw.moveTo(40, 40)
            .arc(40, 40, 28, start, end, false)
            .stroke({ width: 4, color: 0xff3344 });

        const ccw = new Graphics();

        ccw.moveTo(88, 88)
            .arc(88, 88, 28, start, end, true)
            .stroke({ width: 4, color: 0x3388ff });

        scene.addChild(cw);
        scene.addChild(ccw);
    },
};
