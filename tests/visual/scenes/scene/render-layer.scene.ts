import { Graphics, RenderLayer } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render layers correctly',
    create: async (scene: Container) =>
    {
        const graphicsBack = new Graphics().rect(0, 0, 100, 100).fill('red');
        const graphicsFront = new Graphics().rect(0, 0, 50, 50).fill('blue');

        scene.addChild(graphicsFront, graphicsBack);

        const layer = new RenderLayer();

        layer.attach(graphicsFront);

        scene.addChild(layer);
    },
};
