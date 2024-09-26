import { Color } from '../../../../src/color/Color';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render inverse stencil mask',
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
        rect.setMask({
            inverse: true,
        });

        scene.addChild(rect);
        scene.addChild(masky);
    },
};
