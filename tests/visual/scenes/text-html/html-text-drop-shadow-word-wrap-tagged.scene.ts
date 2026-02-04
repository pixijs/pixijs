import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text drop shadow with word wrap and tagged text correctly',
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
                    red: {
                        fill: 'white',
                        dropShadow: {
                            color: 'red',
                            distance: 4,
                            blur: 0,
                            alpha: 1,
                        },
                    },
                    blue: {
                        fill: 'white',
                        dropShadow: {
                            color: 'blue',
                            distance: 4,
                            blur: 0,
                            alpha: 1,
                        },
                    },
                },
            },
        });

        text1.x = 10;
        text1.y = 10;
        scene.addChild(text1);

        const text2 = new HTMLText({
            text: '<shadow>Shadow text</shadow> and <plain>plain text</plain> mixed',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                wordWrap: true,
                wordWrapWidth: 200,
                tagStyles: {
                    shadow: {
                        fill: 'white',
                        dropShadow: {
                            color: 'purple',
                            distance: 5,
                            blur: 2,
                            alpha: 0.8,
                        },
                    },
                    plain: {
                        fill: 'orange',
                    },
                },
            },
        });

        text2.x = 10;
        text2.y = 140;
        scene.addChild(text2);

        const text3 = new HTMLText({
            text: '<glow>This entire sentence has a green glow shadow and wraps to multiple lines</glow>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                wordWrap: true,
                wordWrapWidth: 250,
                tagStyles: {
                    glow: {
                        fill: 'white',
                        dropShadow: {
                            color: 'green',
                            distance: 3,
                            blur: 4,
                            alpha: 1,
                        },
                    },
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
