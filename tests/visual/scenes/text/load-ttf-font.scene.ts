import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should load and display ttf correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/Herborn.ttf');

        const text = new Text({
            text: 'Herborn',
            style: {
                fontFamily: 'Herborn',
                fontSize: 24,
                fill: 'white',
            }
        });

        const textWithBold = new Text({
            text: 'Herborn',
            style: {
                fontFamily: 'Herborn',
                fontWeight: 'bold',
                fontSize: 24,
                fill: 'blue',
            }
        });

        const textWithBoldItatic = new Text({
            text: 'Herborn',
            style: {
                fontFamily: 'Herborn',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: 24,
                fill: 'white',
            }
        });

        textWithBold.position.set(10, 20);
        text.position.set(10, 20);
        textWithBoldItatic.position.set(10, 90);

        scene.addChild(textWithBold);
        scene.addChild(text);
        scene.addChild(textWithBoldItatic);
    },
};
