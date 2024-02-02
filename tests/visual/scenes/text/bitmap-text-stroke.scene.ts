import { Assets } from '../../../../src/assets/Assets';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text with a stroke',
    pixelMatch: 250,
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
            renderMode: 'canvas',
        });

        const textBitmap = new Text({
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
            renderMode: 'bitmap',
        });

        scene.addChild(textCanvas);
        scene.addChild(textBitmap);
    },
};
