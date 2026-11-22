import { Graphics } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render svg polygons and polylines with decimal points',
    create: async (scene: Container) =>
    {
        const graphics = new Graphics().svg(`
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
                <polygon points="16.5,16.5 112.5,64.5 16.5,112.5" fill="#ea1e63" />
                <polyline points="16.5,120.5 64.5,104.5 112.5,120.5" stroke="white" stroke-width="4" />
            </svg>
        `);

        scene.addChild(graphics);
    },
};
