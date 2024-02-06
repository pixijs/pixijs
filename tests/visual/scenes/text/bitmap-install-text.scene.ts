import { Assets } from '../../../../src/assets/Assets';
import { BitmapFontManager } from '../../../../src/scene/text-bitmap/BitmapFontManager';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render installed bitmap text correctly',
    pixelMatch: 1000,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        BitmapFontManager.install('normal-stroke-font', {
            fontFamily: 'Outfit',
            fontSize: 35,
            fill: 'green',
            letterSpacing: 5,
            lineHeight: 20,
            stroke: {
                color: 'yellow',
                width: 4,
            }
        });

        BitmapFontManager.install('small-stroke-font', {
            fontFamily: 'Outfit',
            fontSize: 35 / 2,
            fill: 'green',
            letterSpacing: 5,
            lineHeight: 20,
            stroke: {
                color: 'yellow',
                width: 4 / 2,
            }
        });

        BitmapFontManager.install('large-stroke-font', {
            fontFamily: 'Outfit',
            fontSize: 35 * 2,
            fill: 'green',
            letterSpacing: 5,
            lineHeight: 20,
            stroke: {
                color: 'yellow',
                width: 4 * 2,
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
