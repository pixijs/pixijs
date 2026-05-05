import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render tagged text with lineHeight correctly using split text',
    options: {
        width: 400,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text = new Text({
            text: '<tag1>Hello,</tag1><tag2> world!</tag2>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                lineHeight: 60,
                tagStyles: {
                    tag1: {
                        fill: 'red',
                    },
                    tag2: {
                        fill: 'blue',
                    },
                },
            },
        });

        const splitResult = SplitText.from(text);

        splitResult.x = text.width + 10;

        scene.addChild(text, splitResult);
    },
};
