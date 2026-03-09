import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render large italics correctly',
    excludeRenderers: ['canvas'],
    options: {
        width: 256,
        height: 128,
    },
    create: async (scene: Container) =>
    {
        scene.addChild(new BitmapText({
            text: 'WORLD',
            style: {
                fill: 'white',
                fontStyle: 'italic',
                fontSize: 64,
                fontWeight: 'bold',
            }
        }));
    },
};
