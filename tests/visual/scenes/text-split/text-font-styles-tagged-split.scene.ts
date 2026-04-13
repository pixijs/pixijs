import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render font styles with tagged text correctly using split text',
    options: {
        width: 440,
        height: 200,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new Text({
            text: '<normal>normal</normal> <italic>italic</italic> <oblique>oblique</oblique>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                tagStyles: {
                    normal: { fontStyle: 'normal' },
                    italic: { fontStyle: 'italic' },
                    oblique: { fontStyle: 'oblique' },
                },
            },
            position: { x: 10, y: 10 },
        });

        const split1 = SplitText.from(text1);

        split1.position.set(10, 10);

        const text2 = new Text({
            text: '<normal>Hello World</normal> <small>Hello World</small>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                tagStyles: {
                    normal: { fontWeight: 'normal' },
                    small: { fontVariant: 'small-caps' },
                },
            },
            position: { x: 10, y: 70 },
        });

        const split2 = SplitText.from(text2);

        split2.position.set(10, 70);

        const text3 = new Text({
            text: '<small><bold>Hello</bold> <italic>World</italic></small> <both>Bold+Italic</both>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                tagStyles: {
                    small: { fontVariant: 'small-caps' },
                    bold: { fontWeight: 'bold' },
                    italic: { fontStyle: 'italic' },
                    both: { fontWeight: 'bold', fontStyle: 'italic' },
                },
            },
            position: { x: 10, y: 130 },
        });

        const split3 = SplitText.from(text3);

        split3.position.set(10, 130);

        scene.addChild(split1, split2, split3);
    },
};
