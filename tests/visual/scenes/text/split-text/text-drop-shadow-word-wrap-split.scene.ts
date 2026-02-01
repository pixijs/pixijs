import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render drop shadow with word wrap using split text correctly',
    options: {
        width: 300,
        height: 400,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new Text({
            text: 'Hello world this is a test with wrapping',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                fill: 'white',
                wordWrap: true,
                wordWrapWidth: 200,
                dropShadow: {
                    color: 'red',
                    distance: 4,
                    blur: 0,
                    alpha: 1,
                },
            },
        });

        const split1 = SplitText.from(text1);

        split1.x = 10;
        split1.y = 10;
        scene.addChild(split1);

        const text2 = new Text({
            text: 'Shadow text and plain text mixed',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: 'white',
                wordWrap: true,
                wordWrapWidth: 200,
                dropShadow: {
                    color: 'purple',
                    distance: 5,
                    blur: 2,
                    alpha: 0.8,
                },
            },
        });

        const split2 = SplitText.from(text2);

        split2.x = 10;
        split2.y = 140;
        scene.addChild(split2);

        const text3 = new Text({
            text: 'This entire sentence has a green glow shadow and wraps to multiple lines',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: 'white',
                wordWrap: true,
                wordWrapWidth: 250,
                dropShadow: {
                    color: 'green',
                    distance: 3,
                    blur: 4,
                    alpha: 1,
                },
            },
        });

        const split3 = SplitText.from(text3);

        split3.x = 10;
        split3.y = 260;
        scene.addChild(split3);
    },
};
