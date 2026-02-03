import { FillGradient, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke/fill with padding',
    create: async (scene: Container) =>
    {
        const verticalGradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 }, // Start at top
            end: { x: 0, y: 1 }, // End at bottom
            colorStops: [
                { offset: 0, color: 'red' }, // Red at start
                { offset: 1, color: 'blue' }, // Blue at end
            ],
            textureSpace: 'local',
        });
        const verticalGradient2 = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 }, // Start at top
            end: { x: 0, y: 1 }, // End at bottom
            colorStops: [
                { offset: 0, color: 'white' }, // Blue at end
                { offset: 1, color: 'black' }, // Red at start
            ],
            textureSpace: 'local',
        });

        const noPadding = new Text({ text: 'P: 0', style: { fontSize: 32 } });

        noPadding.x = 0;
        noPadding.y = 0;
        noPadding.style.fill = verticalGradient;
        noPadding.style.stroke = {
            fill: verticalGradient2,
            width: 4,
        };
        noPadding.style.padding = 0;
        scene.addChild(noPadding);

        const withPadding = new Text({ text: 'P: 1000', style: { fontSize: 32 } });

        withPadding.x = 0;
        withPadding.y = noPadding.y + noPadding.height;
        withPadding.style.fill = verticalGradient;
        withPadding.style.padding = 1000;
        withPadding.style.stroke = {
            fill: verticalGradient2,
            width: 4,
        };
        scene.addChild(withPadding);
    },
};
