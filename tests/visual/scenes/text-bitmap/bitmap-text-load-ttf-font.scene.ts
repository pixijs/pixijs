import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should load and display ttf correctly',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/Herborn.ttf');

        const text = new BitmapText({
            text: 'Herborn',
            style: {
                fontFamily: 'Herborn',
                fontSize: 24,
                fontWeight: '100',
                fill: 'white',
            }
        });

        const textWithBold = new BitmapText({
            text: 'Herborn',
            style: {
                fontFamily: 'Herborn',
                fontWeight: '900',
                fontSize: 24,
                fill: 'blue',
            }
        });

        const textWithBoldItatic = new BitmapText({
            text: 'Herborn',
            style: {
                fontFamily: 'Herborn',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: 24,
                fill: 'white',
            }
        });

        textWithBold.position.set(10, 55);
        text.position.set(10, 20);
        textWithBoldItatic.position.set(10, 90);

        scene.addChild(textWithBold);
        scene.addChild(text);
        scene.addChild(textWithBoldItatic);
    },
};
