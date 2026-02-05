import { FillGradient, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render multiline FillGradient in text and its stroke',
    create: async (scene: Container) =>
    {
        const strokeGradient = new FillGradient({
            colorStops: [
                { offset: 0, color: 0xff0000 },
                { offset: 1, color: 0x0000ff },
            ],
        });

        const fillGradient = new FillGradient({
            colorStops: [
                { offset: 0, color: 0xffffff },
                { offset: 1, color: 0x000000 },
            ],
        });

        const textGradient = new Text({
            text: 'Live\nLife\nLove',
            style: {
                fontSize: 36,
                fill:  fillGradient,
                stroke: { fill: strokeGradient, width: 10 },
            },
        });

        scene.addChild(textGradient);
    },
};
