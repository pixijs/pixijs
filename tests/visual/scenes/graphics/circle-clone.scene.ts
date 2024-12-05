import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render cloned circles',
    create: async (scene: Container) =>
    {
        const circle = new Graphics();

        circle
            .circle(0, 0, 16)
            .fill({ color: 0xff0000 });

        circle.position.set(16);
        scene.addChild(circle);

        const circle2 = circle.clone();

        circle2
            .circle(0, 0, 16)
            .stroke({ color: 0x00ff00, width: 2 });
        circle2.position.set(64, 16);

        scene.addChild(circle2);

        const circle3 = circle2.clone(true);

        circle3
            .circle(0, 0, 16)
            .fill({ color: 0xffffff })
            .stroke({ color: 0x0000ff, width: 2 });

        circle3.position.set(40, 48);

        scene.addChild(circle3);
    },
};
