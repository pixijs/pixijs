import { ColorMatrixFilter } from '~/filters';
import { Graphics, RenderLayer } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render layers correctly with filters',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const graphicsBack = new Graphics().rect(0, 0, 100, 100).fill('red');
        const graphicsFront = new Graphics().rect(0, 0, 50, 50).fill('white');

        scene.addChild(graphicsFront, graphicsBack);

        const layer = new RenderLayer();

        const filter = new ColorMatrixFilter();

        graphicsFront.filters = [filter];
        filter.tint('yellow');

        layer.attach(graphicsFront);

        scene.addChild(layer);
    },
};
