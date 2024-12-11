import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text of the same style',
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
