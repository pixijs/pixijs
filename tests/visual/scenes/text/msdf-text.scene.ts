import { Assets } from '../../../../src/assets/Assets';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
