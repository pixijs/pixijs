import { Assets } from '~/assets';
import { FillPattern, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with fill pattern correctly',
    options: {
        width: 256,
        height: 160,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');
        const texture = await Assets.load('bunny.png');

        const pattern = new FillPattern(texture, 'repeat');

        const patternText = new Text({
            text: 'Pattern',
            style: {
                fontFamily: 'Outfit',
                fontSize: 64,
                fill: pattern,
            },
        });

        const solidText = new Text({
            text: 'Solid',
            style: {
                fontFamily: 'Outfit',
                fontSize: 64,
                fill: 0xff0000,
            },
            y: 80,
        });

        scene.addChild(patternText, solidText);
    },
};
