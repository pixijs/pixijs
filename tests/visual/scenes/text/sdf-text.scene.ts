import { Assets } from '@/assets/Assets';
import { BitmapText } from '@/scene/text-bitmap/BitmapText';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';

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
