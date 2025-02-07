import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { RenderLayer } from '../../../../src/scene/layers/RenderLayer';
import { ColorMatrixFilter } from '~/filters/defaults/color-matrix/ColorMatrixFilter';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render layers correctly with filters',
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
