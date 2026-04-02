import { BlurFilter } from '~/filters';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render filters with tagged text correctly using split text',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const filter = new BlurFilter({
            quality: 3
        });

        const text = new Text({
            text: '<red>H</red><blue>I</blue>',
            style: {
                fontSize: 100,
                fill: 'white',
                filters: [filter],
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' },
                },
            }
        });

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);
    },
};
