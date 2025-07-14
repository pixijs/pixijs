import { Color } from '~/color';
import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render inverse stencil mask',
    create: async (scene: Container) =>
    {
        const container = new Container();

        const rect1 = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        container.addChild(rect1);

        const rect2 = new Graphics()
            .rect(10, 10, 80, 80)
            .fill(new Color('green'));

        container.addChild(rect2);

        const masky = new Graphics()
            .star(120, 120, 5, 100)
            .fill(new Color('yellow'));

        masky.width = 80;
        masky.height = 80;

        container.mask = masky;
        container.setMask({
            inverse: true,
        });

        scene.addChild(container);
        scene.addChild(masky);
    },
};
