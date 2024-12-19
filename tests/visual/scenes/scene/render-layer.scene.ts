import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { RenderLayer } from '../../../../src/scene/layers/RenderLayer';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
