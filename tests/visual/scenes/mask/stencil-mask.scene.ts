import { Color } from '~/color';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stencil mask',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        const masky = new Graphics()
            .star(120, 120, 5, 100)
            .fill(new Color('yellow'));

        masky.width = 80;
        masky.height = 80;

        rect.mask = masky;

        scene.addChild(rect);
        scene.addChild(masky);
    },
};
