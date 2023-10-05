import { Color } from '../../../../src/color/Color';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render alpha from a Color',
    create: async (scene: Container) =>
    {
        const rect = new Graphics().rect(0, 0, 100, 100).fill(new Color('hsl(17, 100%, 50%)').setAlpha(0.5));

        scene.addChild(rect);
    },
};
