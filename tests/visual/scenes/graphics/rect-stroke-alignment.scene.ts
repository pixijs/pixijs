import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke alignment',
    create: async (scene: Container) =>
    {
        const rect = new Graphics()
            .rect(8, 8, 50, 50)
            .stroke({
                width: 4,
                color: 'blue',
                alignment: -1
            })
            .fill('red');

        scene.addChild(rect);

        const rect2 = new Graphics()
            .rect(64, 64, 50, 50)
            .stroke({
                width: 4,
                color: 'blue',
                alignment: 1
            })
            .fill({
                color: 'red',
                alpha: 0.5
            });

        scene.addChild(rect2);
    },
};
