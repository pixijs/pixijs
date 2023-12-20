import { Assets } from '../../../../src/assets/Assets';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sdf-text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/sdf/comicsdf.fnt');

        const text = new BitmapText({
            text: 'M',
            style: {
                fontFamily: 'comicsdf',
                fontSize: 150,
                fill: 'white',
            }
        });

        text.position.set(-3, -50);
        scene.addChild(text);
    },
};
