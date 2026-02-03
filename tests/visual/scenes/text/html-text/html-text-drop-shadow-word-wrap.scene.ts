import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text drop shadow with word wrap correctly',
    options: {
        width: 300,
        height: 400,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new HTMLText({
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

        text1.x = 10;
        text1.y = 10;
        scene.addChild(text1);

        const text2 = new HTMLText({
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

        text2.x = 10;
        text2.y = 140;
        scene.addChild(text2);

        const text3 = new HTMLText({
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

        text3.x = 10;
        text3.y = 260;
        scene.addChild(text3);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
