import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break at any character with breakWords:true (CSS break-all)',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const style = {
            fontFamily: 'Outfit',
            fontSize: 20,
            wordWrap: true,
            wordWrapWidth: 80,
            breakWords: true, // CSS break-all behavior
        };

        // With break-all, text breaks at any character to fill lines
        const text1 = new BitmapText({
            text: 'Thiswillbreak',
            style,
        });

        const text2 = new BitmapText({
            text: 'Hello World Test',
            style,
            position: { x: 0, y: 50 }
        });

        scene.addChild(text1);
        scene.addChild(text2);
    },
};
