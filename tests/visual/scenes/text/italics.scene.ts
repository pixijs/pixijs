import { Text } from '../../../../src/scene/text/Text';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render italics correctly',
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

        scene.addChild(new Text({
            text: 'Italic',
            style: {
                fill: 'white',
                fontStyle: 'italic',
                fontSize: 32
            }
        })).position.set(0, 40);
    },
};
