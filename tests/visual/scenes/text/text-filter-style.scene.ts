import { BlurFilter } from '~/filters';
import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with filters correctly',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const filter = new BlurFilter({
            quality: 3
        });

        const text = new Text({
            text: 'HI',
            style: {
                fontSize: 100,
                fill: 'white',
                filters: [filter]
            }
        });

        scene.addChild(text);
    },
};
