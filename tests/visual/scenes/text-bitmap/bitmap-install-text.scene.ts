import { Assets } from '~/assets';
import { BitmapFont, BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render installed bitmap text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        BitmapFont.install({
            name: 'normal-stroke-font',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35,
                fill: 'green',
                letterSpacing: 5,
                lineHeight: 20,
                stroke: {
                    color: 'yellow',
                    width: 4,
                }
            }
        });

        BitmapFont.install({
            name: 'small-stroke-font',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35 / 2,
                fill: 'green',
                letterSpacing: 5,
                lineHeight: 20,
                stroke: {
                    color: 'yellow',
                    width: 4 / 2,
                }
            }
        });

        BitmapFont.install({
            name: 'large-stroke-font',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35 * 2,
                fill: 'green',
                letterSpacing: 5,
                lineHeight: 20,
                stroke: {
                    color: 'yellow',
                    width: 4 * 2,
                }
            }
        });

        const textBitmap = new BitmapText({
            text: 'Canvas',
            style: {
                fontFamily: 'normal-stroke-font',
                fontSize: 35,
            },
        });

        const textBitmap2 = new BitmapText({
            text: 'Canvas',
            style: {
                fontFamily: 'small-stroke-font',
                fontSize: 35,
            },
            y: 30,
        });

        const textBitmap3 = new BitmapText({
            text: 'Canvas',
            style: {
                fontFamily: 'large-stroke-font',
                fontSize: 35,
            },
            y: 60,
        });

        scene.addChild(textBitmap);
        scene.addChild(textBitmap2);
        scene.addChild(textBitmap3);
    },
};
