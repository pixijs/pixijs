import { Assets } from '~/assets';
import { BitmapFont, BitmapText, SplitBitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render a split bitmap correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        BitmapFont.install({
            name: 'normal-stroke-font',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35,
                fill: 'green',
                letterSpacing: 5,
                lineHeight: 20,
                stroke: {
                    color: 'yellow',
                    width: 4,
                }
            }
        });

        const textBitmap = new BitmapText({
            text: 'Canvas',
            style: {
                fontFamily: 'normal-stroke-font',
                fontSize: 35,
            },
        });

        // Split the text into characters and words
        const splitResult = SplitBitmapText.from(textBitmap);

        scene.addChild(splitResult);
        // move each character to a fixed y position
        splitResult.chars.forEach((char, i) =>
        {
            char.y = 10 + (i * 10);
            scene.addChild(char);
        });
    },
};
