import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render msdf-text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/msdf/Roboto-Regular.fnt');

        const text = new BitmapText({
            text: 'MXA',
            style: {
                fontFamily: 'Roboto-Regular',
                fontSize: 70,
                fill: 'white',
            },
            rotation: Math.PI / 4,
            anchor: 0.5,
            x: 128 / 2,
            y: 128 / 2,
        });

        scene.addChild(text);
    },
};
