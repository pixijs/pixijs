import { BitmapFont } from '../../../../src/scene/text-bitmap/BitmapFont';
import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render both emoji in bitmap text',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        BitmapFont.install({
            name: 'outfit-emoji',
            style: {
                fontFamily: 'Outfit',
                fontSize: 50,
            },
        });

        const textBitmap = new BitmapText({
            text: `🔥🫱🏿‍🫲🏻\n👨🏾‍⚕️🇹🇼`,
            style: {
                fontFamily: 'outfit-emoji',
                fontSize: 50,
            },
        });

        scene.addChild(textBitmap);
    },
};
