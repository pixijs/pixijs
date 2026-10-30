import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should clear previous frame with multiView and transparent background',
    renderers: ['webgl2'],
    options: {
        backgroundAlpha: 0,
        multiView: true,
    },
    create: async (scene: Container, _renderer: Renderer) =>
    {
        const rect = new Graphics()
            .rect(20, 20, 88, 88)
            .fill('red');

        scene.addChild(rect);
    },
};
