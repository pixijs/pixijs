import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke',
    create: async (scene: Container) =>
    {
        const rect = new Graphics().rect(4, 4, 50, 50).fill('red').stroke({
            width: 4,
            color: 'blue',
        });

        scene.addChild(rect);

        const rect2 = new Graphics()
            .rect(64, 64, 50, 50)
            .stroke({
                width: 4,
                color: 'blue',
            })
            .fill('red');

        scene.addChild(rect2);
    },
};
