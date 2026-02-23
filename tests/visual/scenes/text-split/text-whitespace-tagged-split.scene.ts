import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render whitespace with tagged text correctly using split text',
    options: {
        width: 800,
        height: 950,
    },
    skip: true,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const testText = 'Hello    <red>World</red>\n\n<blue>New Line</blue>';
        // eslint-disable-next-line max-len
        const longText = ' Should have\tspace\u2003at the\u2000beginning of the line.\n   And 3 more here. But after that there should be no\u3000more ridiculous spaces at the beginning of lines. And none at the end. And all this text is just to check the wrapping abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz. I \u2665 text. 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2     ';
        const modes = ['normal', 'pre', 'pre-line'] as const;
        const columnWidth = 700 / 3;

        modes.forEach((mode, i) =>
        {
            const x = (i * columnWidth) + (columnWidth / 2);

            const label = new Text({
                text: mode,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 24,
                    fill: 0x000000,
                },
            });

            label.anchor.set(0.5, 0);
            label.x = x;
            label.y = 10;
            scene.addChild(label);

            const text = new Text({
                text: testText,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 28,
                    fill: 0xffffff,
                    wordWrap: true,
                    wordWrapWidth: columnWidth - 20,
                    whiteSpace: mode,
                    tagStyles: {
                        red: { fill: 'red' },
                        blue: { fill: 'blue' },
                    },
                },
            });

            const splitResult = SplitText.from(text);

            splitResult.x = x;
            splitResult.y = 50;
            scene.addChild(splitResult);

            const longTextObj = new Text({
                text: longText,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 20,
                    fontStyle: 'italic',
                    fontWeight: '900',
                    fill: 0xffffff,
                    wordWrap: true,
                    wordWrapWidth: columnWidth - 20,
                    breakWords: true,
                    letterSpacing: 4,
                    whiteSpace: mode,
                },
            });

            const longSplit = SplitText.from(longTextObj);

            longSplit.x = x;
            longSplit.y = 200;
            scene.addChild(longSplit);
        });

        const text4 = new Text({
            text: '<green>Multiple    spaces</green>\tand\t<yellow>tabs</yellow>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: 0xffffff,
                whiteSpace: 'pre',
                tagStyles: {
                    green: { fill: 'green' },
                    yellow: { fill: 'yellow' },
                },
            },
        });

        const s4 = SplitText.from(text4);

        s4.x = 10;
        s4.y = 880;
        scene.addChild(s4);
    },
};
