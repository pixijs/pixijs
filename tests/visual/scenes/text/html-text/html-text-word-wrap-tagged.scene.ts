import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text word wrap with tagged text correctly',
    options: {
        width: 300,
        height: 400,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new HTMLText({
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

        text1.x = 10;
        text1.y = 10;
        scene.addChild(text1);

        const text2 = new HTMLText({
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

        text2.x = 10;
        text2.y = 120;
        scene.addChild(text2);

        const text3 = new HTMLText({
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

        text3.x = 10;
        text3.y = 240;
        scene.addChild(text3);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
