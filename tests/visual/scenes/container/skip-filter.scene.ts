import { ColorMatrixFilter, NoiseFilter } from '~/filters';
import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should skip filters correctly',
    create: async (scene: Container) =>
    {
        const container = new Container({
            x:  128 / 2 / 2,
            y:  128 / 2 / 2,
        });

        container.filters = [new NoiseFilter()];
        container.filters[0].enabled = false;

        const circle = new Graphics()
            .circle(0, 0, 50)
            .fill('yellow');

        circle.x = 128 / 2 / 2;
        circle.y = 128 / 2 / 2;

        const cm = new ColorMatrixFilter();

        cm.hue(140, true);
        circle.filters = cm;

        scene.addChild(container);
        container.addChild(circle);

        scene.filters = [];
    },
};
