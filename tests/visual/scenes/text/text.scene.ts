import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text correctly if style changes',
    pixelMatch: 1000,
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
            // renderMode: 'bitmap'
        });

        scene.addChild(text);

        text.style.wordWrap = true;
        text.style.fill = 'red';
        text.style.wordWrapWidth = 120;
    },
};
