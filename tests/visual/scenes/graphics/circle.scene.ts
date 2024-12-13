import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render circles',
    create: async (scene: Container) =>
    {
        const circle = new Graphics();

        circle
            .moveTo(32, 32)
            .circle(32, 32, 32)
            .fill({ color: 0xff0000 });

        circle.x += 20;
        circle.scale.set(2, 1);
        circle.angle += 30;

        scene.addChild(circle);

        const circle2 = new Graphics();

        circle2
            .moveTo(32, 32)
            .circle(32, 32, 32)
            .stroke({ color: 0x00ff00, width: 2 });

        circle2.position.set(32, 32);

        scene.addChild(circle2);

        const circle3 = new Graphics();

        circle3
            .moveTo(32, 32)
            .circle(32, 32, 20)
            .fill({ color: 0xffffff })
            .circle(40, 32, 10)
            .cut();

        circle3.position.set(5, 10);

        scene.addChild(circle3);

        // adaptive circle
        const circle4 = new Graphics();

        circle4
            .circle(2, 2, 1)
            .stroke({ color: 0x00ffff, width: 0.05 });
        circle4.scale.set(40);

        scene.addChild(circle4);
    },
};
