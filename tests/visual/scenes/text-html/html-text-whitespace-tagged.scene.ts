import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text whitespace with tagged text correctly',
    options: {
        width: 800,
        height: 950,
    },
    create: async (scene: Container, renderer) =>
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

            const label = new HTMLText({
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

            const text = new HTMLText({
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

            text.anchor.set(0.5, 0);
            text.x = x;
            text.y = 50;
            scene.addChild(text);

            const longTextObj = new HTMLText({
                text: longText,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 20,
                    fontStyle: 'italic' as const,
                    fontWeight: '900',
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

        const text4 = new HTMLText({
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

        text4.x = 10;
        text4.y = 880;
        scene.addChild(text4);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 350));
    },
};
