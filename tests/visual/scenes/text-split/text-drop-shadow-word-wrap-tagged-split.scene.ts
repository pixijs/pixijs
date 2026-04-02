import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render drop shadow with word wrap and tagged text correctly using split text',
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

        const split1 = SplitText.from(text1);

        split1.x = 10;
        split1.y = 10;
        scene.addChild(split1);

        const text2 = new Text({
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

        const split2 = SplitText.from(text2);

        split2.x = 10;
        split2.y = 140;
        scene.addChild(split2);

        const text3 = new Text({
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

        const split3 = SplitText.from(text3);

        split3.x = 10;
        split3.y = 260;
        scene.addChild(split3);
    },
};
