import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render word wrap with tagged text correctly using split text',
    options: {
        width: 300,
        height: 400,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new Text({
            text: 'Hello <red>world this is</red> a <blue>test with wrapping</blue>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' },
                },
            },
        });

        const s1 = SplitText.from(text1);

        s1.x = 10;
        s1.y = 10;
        scene.addChild(s1);

        const text2 = new Text({
            text: '<green>Supercalifragilistic</green>expialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: false,
                tagStyles: {
                    green: { fill: 'green' },
                },
            },
        });

        const s2 = SplitText.from(text2);

        s2.x = 10;
        s2.y = 120;
        scene.addChild(s2);

        const text3 = new Text({
            text: '<yellow>Super<orange>califragilistic</orange>expialidocious</yellow>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: true,
                tagStyles: {
                    yellow: { fill: 'yellow' },
                    orange: { fill: 'orange' },
                },
            },
        });

        const s3 = SplitText.from(text3);

        s3.x = 10;
        s3.y = 240;
        scene.addChild(s3);
    },
};
