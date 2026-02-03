import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text correctly if style changes using split text',
    create: async (scene: Container) =>
    {
        const text = new Text({
            text: 'I should be red & white and wrapping with shadow 🔥',
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
            },
        });

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);

        splitResult.style.wordWrap = true;
        splitResult.style.fill = 'red';
        splitResult.style.wordWrapWidth = 120;
        splitResult.styleChanged();
    },
};
