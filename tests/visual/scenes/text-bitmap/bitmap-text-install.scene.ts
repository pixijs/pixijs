import { Assets } from '~/assets';
import { BitmapFont, BitmapFontManager, BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render an installed font correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        BitmapFont.install({
            name: 'big-outfit',
            style: {
                fontSize: 200,
                stroke: {
                    width: 18,
                    join: 'round',
                },
            },
            chars: BitmapFontManager.NUMERIC,
            textureStyle: {
                scaleMode: 'nearest',
            },
        });

        const textBitmap = new BitmapText({
            text: 1234,
            style: {
                fontFamily: 'big-outfit',
                fontSize: 20,
            },
            anchor: 0.5,
            position: {
                x: 128 / 2,
                y: 128 / 2,
            },
            scale: 8,
        });

        scene.addChild(textBitmap);
    },
};
