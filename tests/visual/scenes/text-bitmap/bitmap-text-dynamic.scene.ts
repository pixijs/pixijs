import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render dynamic bitmap font with same style',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const style = { fontFamily: 'Arial', fontSize: 30 };

        const text1 = new BitmapText({ text: 'abcdefgh', style });

        const text2 = new BitmapText({
            text: ' ijk', // The leading whitespace is intentional to test how BitmapText handles it.
            style, y: 40,
        });

        scene.addChild(text1);
        scene.addChild(text2);
    },
};
