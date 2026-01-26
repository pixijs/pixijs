import { BlurFilter } from '~/filters';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with filters using split text correctly',

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

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);
    },
};
