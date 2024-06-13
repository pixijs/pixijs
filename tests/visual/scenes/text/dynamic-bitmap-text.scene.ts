import { Assets } from '../../../../src/assets/Assets';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text of the same style',
    pixelMatch: 250,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new BitmapText({
            text: 'hello!',
            style: {
                fontFamily: 'Outfit',
                fontSize: 32,
                fill: 'white',
            }
        });

        const text2 = new BitmapText({
            text: 'hello!',
            style: {
                fontFamily: 'Outfit',
                fontSize: 40,
                stroke: {
                    color: 0x0000FF,
                    width: 5,
                }
            },
            y: 30,
        });

        const text3 = new BitmapText({
            text: 'hello!',
            style: {
                fontFamily: 'Outfit',
                fontSize: 32,
                fill: 'blue',
                stroke: {
                    color: 0xFF0000,
                    width: 4,
                }
            },
            y: 80,
        });

        scene.addChild(text1);
        scene.addChild(text2);
        scene.addChild(text3);
    },
};
