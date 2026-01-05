import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render leading correctly',
    options: {
        width: 400,
        height: 100,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baseStyle = {
            fontFamily: 'Outfit',
            fontSize: 24,
            fill: 0x000000,
            padding: 10,
        };

        const values = [0, 10, 20];
        let x = 10;

        for (const leading of values)
        {
            const text = new Text({
                text: `ld:${leading}\nLine2`,
                style: { ...baseStyle, leading },
            });

            text.position.set(x, 10);
            scene.addChild(text);
            x += 130;
        }
    },
};
