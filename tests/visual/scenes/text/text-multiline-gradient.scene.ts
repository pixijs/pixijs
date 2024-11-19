import { FillGradient } from '../../../../src/scene/graphics/shared/fill/FillGradient';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render multiline FillGradient in text and its stroke',
    create: async (scene: Container) =>
    {
        const strokeGradient = new FillGradient(0, 0, 0, 1)
            .addColorStop(0, 0xff0000)
            .addColorStop(1, 0x0000ff);

        const fillGradient = new FillGradient(0, 0, 0, 1)
            .addColorStop(0, 0xffffff)
            .addColorStop(1, 0x000000);

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
