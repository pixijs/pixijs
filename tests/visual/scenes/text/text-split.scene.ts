import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a split text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const textBitmap = new Text({
            text: 'Canvas',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35,
            },
        });

        // Split the text into characters and words
        const splitResult = SplitText.from(textBitmap);

        scene.addChild(splitResult);

        // move each character to a fixed y position
        splitResult.chars.forEach((char, i) =>
        {
            char.y = 10 + (i * 10);
            scene.addChild(char);
        });
    },
};
