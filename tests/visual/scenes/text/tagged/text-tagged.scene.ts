import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render tagged text with different fills correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text = new Text({
            text: '<green>I should</green> be red & white and wrapping with shadow 🔥',
            style: {
                fontSize: 18,
                fill: 'white',
                stroke: { color: 'white', width: 2 },
                lineHeight: 15,
                letterSpacing: 6,
                align: 'center',
                dropShadow: {
                    alpha: 1,
                    angle: Math.PI / 6,
                    blur: 5,
                    color: 'blue',
                    distance: 5,
                },
                tagStyles: {
                    green: { fill: 'white' },
                },
            }
        });

        scene.addChild(text);

        text.style.wordWrap = true;
        text.style.fill = 'red';
        text.style.tagStyles = {
            green: { fill: 'green' },
        };
        text.style.wordWrapWidth = 120;
    },
};
