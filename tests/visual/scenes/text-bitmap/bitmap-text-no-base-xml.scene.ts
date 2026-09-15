import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render bitmap text when xml font data has no base value',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/font-xml-no-base.fnt');

        const text = new BitmapText({
            text: 'ABCD',
            style: {
                fontFamily: 'fontXMLNoBase',
                fontSize: 24,
            },
            x: 8,
            y: 8,
        });

        scene.addChild(text);
    },
};
