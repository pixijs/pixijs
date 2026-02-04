import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break words for bitmap text if breakWords sets to true',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const style = {
            fontFamily: 'Outfit',
            fontSize: 24,
            wordWrap: true,
            wordWrapWidth: 72,
        };

        const bitmapTextBreakWords = new BitmapText({
            text: 'thiswillbreak',
            style: {
                ...style,
                breakWords: true,
            },
        });

        const bitmapTextNotBreakWords = new BitmapText({
            text: 'thiswillnotbreak',
            style: {
                ...style,
                breakWords: false,
            },
            position: { x: 0, y: bitmapTextBreakWords.height + 10 }
        });

        scene.addChild(bitmapTextBreakWords);
        scene.addChild(bitmapTextNotBreakWords);
    },
};
