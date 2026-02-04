import { Graphics, SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke with split text if it has a width of zero',
    create: async (scene: Container) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            stroke: {
                color: 0x000000,
                width: 0,
            },
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 200,
            breakWords: true,
        });

        const text = new Text({
            text: 'PixiJS is very cool indeed',
            style
        });

        const splitResult = SplitText.from(text);

        const whiteBox = new Graphics().rect(0, 0, 128, 128).fill(0xFFFFFF);

        scene.addChild(whiteBox);
        scene.addChild(splitResult);
    },
};
