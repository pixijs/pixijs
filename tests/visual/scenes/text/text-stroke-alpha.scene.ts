import { Text } from '../../../../src/scene/text/Text';
import { TextStyle } from '../../../../src/scene/text/TextStyle';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render stroke and fill alpha separately',
    create: async (scene: Container) =>
    {
        const style = new TextStyle({
            fill: 'rgba(255, 0, 0, 0.25)',
            fontSize: 64,
            stroke: {
                width: 4,
            }
        });

        const text1 = new Text({ text: 'Hi', style });
        const text2 = new BitmapText({ text: 'Hi', style });

        text2.position.set(0, 64);

        scene.addChild(text1);
        scene.addChild(text2);
    },
};
