import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text correctly with texture style',
    create: async (scene: Container) =>
    {
        const text = new Text({
            text: 'X',
            style: {
                fontSize: 18,
                fill: 'white',
                lineHeight: 15,
                letterSpacing: 6,
                align: 'center',

            },
            textureStyle: {
                scaleMode: 'nearest',
            },
            // renderMode: 'bitmap'
        });

        scene.addChild(text);

        text.scale = 10;
    },
};
