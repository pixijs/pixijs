import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render italics correctly',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        scene.addChild(new BitmapText({
            text: 'Italic',
            style: {
                fill: 'white',
                fontStyle: 'italic',
                fontSize: 32
            }
        }));
    },
};
