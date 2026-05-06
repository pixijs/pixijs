import { Color } from '~/color';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render alpha from a Color',
    create: async (scene: Container) =>
    {
        const rect = new Graphics().rect(0, 0, 100, 100).fill(new Color('hsl(17, 100%, 50%)').setAlpha(0.5));

        scene.addChild(rect);
    },
};
