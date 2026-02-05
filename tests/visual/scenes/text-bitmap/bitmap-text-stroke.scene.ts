import { Assets } from '~/assets';
import { BitmapText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text with a stroke',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const textCanvas = new Text({
            text: 'Canvas',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35,
                fill: 'white',
                letterSpacing: 5,
                lineHeight: 20,
                stroke: {
                    color: 0xff0000,
                    width: 4,
                }
            },
        });

        const textBitmap = new BitmapText({
            text: 'Canvas',
            style: {
                fontFamily: 'Outfit',
                fontSize: 35,
                letterSpacing: 5,
                stroke: {
                    color: 0xff0000,
                    width: 4,
                }
            },
            y: 30,
        });

        scene.addChild(textCanvas);
        scene.addChild(textBitmap);
    },
};
