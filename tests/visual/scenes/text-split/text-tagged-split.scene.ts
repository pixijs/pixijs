import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render tagged text with different fills correctly using split text',
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

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);

        splitResult.style.wordWrap = true;
        splitResult.style.fill = 'red';
        splitResult.style.tagStyles = {
            green: { fill: 'green' },
        };
        splitResult.style.wordWrapWidth = 120;
        splitResult.styleChanged();
    },
};
