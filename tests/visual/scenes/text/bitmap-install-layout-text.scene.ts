import { Assets } from '../../../../src/assets/Assets';
import { BitmapFont } from '../../../../src/scene/text-bitmap/BitmapFont';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render installed bitmap layout text correctly',
    pixelMatch: 1500,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        BitmapFont.install({
            name: 'normal-stroke-font',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'blue',
                letterSpacing: 5,
                stroke: {
                    color: 'white',
                    width: 4,
                }
            },
        });

        const textBitmap = new BitmapText({
            text: 'Bitmap\nText,\n so cool!',
            style: {
                fontFamily: 'normal-stroke-font',
                fontSize: 35,
            },
            anchor: { x: 0.5, y: 0.5 },
            position: { x: 128 / 2, y: 128 / 2 }

        });

        scene.addChild(textBitmap);
    },
};
