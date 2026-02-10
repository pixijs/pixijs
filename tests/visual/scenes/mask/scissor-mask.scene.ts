import { Color } from '~/color';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render scissor mask',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 128, 128)
            .fill(new Color('red'));

        const masky = new Graphics()
            .rect(20, 20, 80, 80)
            .fill(new Color('yellow'));

        rect.mask = masky;

        scene.addChild(rect);
        scene.addChild(masky);
    },
};
