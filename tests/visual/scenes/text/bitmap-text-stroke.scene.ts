import { Assets } from '../../../../src/assets/Assets';
import { Text } from '../../../../src/scene/text/Text';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text with a stroke',
    pixelMatch: 700,
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
