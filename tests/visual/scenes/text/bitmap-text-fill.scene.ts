import { Assets } from '../../../../src/assets/Assets';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render bitmap text fill correctly',
    pixelMatch: 250,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');
        const blackBM = new Text({
            text: 'Im fill 0x0',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
                fill: 0x0
            },
            renderMode: 'bitmap',
        });

        scene.addChild(blackBM);

        const undefinedBM = new Text({
            text: 'Im fill undefined',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
            },
            y: 30,
            renderMode: 'bitmap',
        });

        scene.addChild(undefinedBM);

        const redBM = new Text({
            text: 'Im fill red',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
                fill: 'red'
            },
            y: 60,
            renderMode: 'bitmap',
        });

        scene.addChild(redBM);
    },
};
