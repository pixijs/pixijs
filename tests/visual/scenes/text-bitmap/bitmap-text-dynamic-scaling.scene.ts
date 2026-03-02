import { BitmapText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should scale dynamic bitmap and canvas text consistently across font sizes',
    options: {
        width: 300,
        height: 300,
    },
    create: async (scene: Container) =>
    {
        const fontFamily = 'Verdana';

        const textStyle = {
            fontFamily,
            fill: 0xffffff,
        };

        let y = 0;

        for (let height = 8; height <= 32; height += 2)
        {
            y += height;
            const label = `Hello ${height}`;

            scene.addChild(new BitmapText({
                text: label,
                style: { ...textStyle, fontSize: height },
                x: 10,
                y,
            }));

            scene.addChild(new Text({
                text: label,
                style: { ...textStyle, fontSize: height },
                x: 150,
                y,
            }));
        }
    },
};
