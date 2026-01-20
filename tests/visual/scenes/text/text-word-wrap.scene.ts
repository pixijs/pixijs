import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render word wrap correctly',
    options: {
        width: 300,
        height: 350,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        // Test 1: Normal word wrap with sentence
        const text1 = new Text({
            text: 'Hello world this is a test',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
            },
        });

        text1.x = 10;
        text1.y = 10;
        scene.addChild(text1);

        // Test 2: breakWords: false with long word
        const text2 = new Text({
            text: 'Supercalifragilisticexpialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: false,
            },
        });

        text2.x = 10;
        text2.y = 110;
        scene.addChild(text2);

        // Test 3: breakWords: true with same long word
        const text3 = new Text({
            text: 'Supercalifragilisticexpialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: true,
            },
        });

        text3.x = 10;
        text3.y = 200;
        scene.addChild(text3);
    },
};
