import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke line joins correctly',
    options: {
        width: 200,
        height: 300,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const lineJoins: Array<'miter' | 'round' | 'bevel'> = ['miter', 'round', 'bevel'];

        lineJoins.forEach((join, index) =>
        {
            const text = new Text({
                text: 'MWV',
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 64,
                    fill: 'white',
                    stroke: {
                        color: 0x333333,
                        width: 16,
                        join,
                    },
                },
            });

            text.x = 20;
            text.y = 20 + (index * 92);
            scene.addChild(text);
        });
    },
};
