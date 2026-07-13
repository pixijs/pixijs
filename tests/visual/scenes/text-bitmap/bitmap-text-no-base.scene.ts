import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render bitmap text when font data has no base value',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/font-text-no-base.fnt');

        const text = new BitmapText({
            text: 'ABCD',
            style: {
                fontFamily: 'fontTextNoBase',
                fontSize: 24,
            },
            x: 8,
            y: 8,
        });

        scene.addChild(text);
    },
};
