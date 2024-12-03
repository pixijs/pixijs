import { Text } from '@/scene/text/Text';
import { TextStyle } from '@/scene/text/TextStyle';
import { BitmapText } from '@/scene/text-bitmap/BitmapText';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';

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
