import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render whitespace modes correctly',
    options: {
        width: 700,
        height: 850,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const testText = 'Hello    World\n\nNew Line';
        // eslint-disable-next-line max-len
        const longText = ' Should have\tspace\u2003at the\u2000beginning of the line.\n   And 3 more here. But after that there should be no\u3000more ridiculous spaces at the beginning of lines. And none at the end. And all this text is just to check the wrapping abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz. I \u2665 text. 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2     ';
        const modes = ['normal', 'pre', 'pre-line'] as const;
        const columnWidth = 700 / 3;

        modes.forEach((mode, i) =>
        {
            const x = (i * columnWidth) + (columnWidth / 2);

            const label = new BitmapText({
                text: mode,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 28,
                    fill: 0x000000,
                },
            });

            label.anchor.set(0.5, 0);
            label.x = x;
            label.y = 10;
            scene.addChild(label);

            const text = new BitmapText({
                text: testText,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 28,
                    fill: 0xffffff,
                    wordWrap: true,
                    wordWrapWidth: columnWidth - 20,
                    whiteSpace: mode,
                },
            });

            text.anchor.set(0.5, 0);
            text.x = x;
            text.y = 50;
            scene.addChild(text);

            const longTextObj = new BitmapText({
                text: longText,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 20,
                    fill: 0xffffff,
                    wordWrap: true,
                    wordWrapWidth: columnWidth - 20,
                    breakWords: true,
                    letterSpacing: 4,
                    whiteSpace: mode,
                },
            });

            longTextObj.anchor.set(0.5, 0);
            longTextObj.x = x;
            longTextObj.y = 200;
            scene.addChild(longTextObj);
        });
    },
};
