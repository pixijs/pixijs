import { Assets } from '../../../../src/assets/Assets';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render bitmap text fill correctly',
    pixelMatch: 250,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');
        const blackBM = new BitmapText({
            text: 'Im fill 0x0',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
                fill: 0x0
            },
        });

        scene.addChild(blackBM);

        const undefinedBM = new BitmapText({
            text: 'Im fill undefined',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
            },
            y: 30,
        });

        scene.addChild(undefinedBM);

        const redBM = new BitmapText({
            text: 'Im fill red',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
                fill: 'red'
            },
            y: 60,
        });

        scene.addChild(redBM);
    },
};
