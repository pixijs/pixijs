import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text whitespace with tagged text correctly',
    options: {
        width: 800,
        height: 250,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const testText = 'Hello    <red>World</red>\n\n<blue>New Line</blue>';
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
        text4.y = 180;
        scene.addChild(text4);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
