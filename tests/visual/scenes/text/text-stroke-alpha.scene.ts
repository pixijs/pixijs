import { BitmapText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

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
