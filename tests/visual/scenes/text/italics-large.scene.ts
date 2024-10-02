import { Text } from '../../../../src/scene/text/Text';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render large italics correctly',
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

        scene.addChild(new Text({
            text: 'WORLD',
            style: {
                fill: 'white',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: 64
            }
        })).position.set(0, 64);
    },
};
