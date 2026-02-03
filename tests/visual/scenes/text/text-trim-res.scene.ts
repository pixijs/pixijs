import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text trim correctly at different resolutions',
    create: async (scene: Container) =>
    {
        const text = new Text({
            text: 'TRIM',
            style: {
                fontFamily: 'Arial',
                fontSize: 40,
                fill: 'white',
                trim: true,
            },
        });

        scene.addChild(text);

        const text2 = new Text({
            text: 'TRIM',
            style: {
                fontFamily: 'Arial',
                fontSize: 40,
                fill: 'white',
                trim: true,
            },
            position: { x: 0, y: 50 },
            resolution: 4,
        });

        scene.addChild(text2);
    },
};
