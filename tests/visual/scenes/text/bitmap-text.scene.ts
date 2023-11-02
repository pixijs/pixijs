import { Assets } from '../../../../src/assets/Assets';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text of the same style',

    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');
        const textCanvas = new Text({
            text: 'Im canvas',
            style: {
                fontFamily: 'Outfit',
                fontSize: 20,
                fill: 'white',
            }
        });

        const textBitmap = new Text({
            text: 'Im dynamic \nbitmap',
            style: {
                fontFamily: 'Outfit',
                fontSize: 20,
                fill: 'white',
            },
            y: 30,
        });

        scene.addChild(textCanvas);

        scene.addChild(textBitmap);
    },
};
