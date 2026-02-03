import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';

export const scene: TestScene = {
    it: 'should render odd sized polygon correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        // in this situation, the buffer size that needs to bu uploaded
        // is not a multiple of 4, so we need to know it can render a shape
        // like that correctly in WebGPU
        const container = new Container();
        const polygon = new Graphics();

        container.addChild(polygon);

        polygon.clear();
        polygon.regularPoly(128, 128, 64, 4, 0);
        polygon.fill({ color: 0xff0000 });

        renderer.render(container);

        polygon.clear();
        polygon.regularPoly(128, 128, 64, 3, 0);
        polygon.fill({ color: 0xff0000 });

        container.scale.set(0.5);

        scene.addChild(container);
    },
};
