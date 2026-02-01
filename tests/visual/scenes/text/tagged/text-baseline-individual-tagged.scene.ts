import { Assets } from '~/assets';
import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with different baselines correctly',
    options: {
        width: 400,
        height: 30,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const TEXT_Y = 0;
        const FONT_SIZE = 20;

        const textAlphabetic = new Text({
            text: 'alpha<b>betic</b>',
            style: {
                fontFamily: 'Outfit',
                fontSize: FONT_SIZE,
                fill: 'black',
                textBaseline: 'alphabetic',
                tagStyles: {
                    b: { fontWeight: 'bold', fill: 'red' },
                },
            },
        });

        textAlphabetic.x = 10;
        textAlphabetic.y = TEXT_Y;
        scene.addChild(textAlphabetic);

        const textBottom = new Text({
            text: 'bot<i>tom</i>',
            style: {
                fontFamily: 'Outfit',
                fontSize: FONT_SIZE,
                fill: 'black',
                textBaseline: 'bottom',
                tagStyles: {
                    i: { fontStyle: 'italic', fill: 'blue' },
                },
            },
        });

        textBottom.x = 140;
        textBottom.y = TEXT_Y;
        scene.addChild(textBottom);

        const textMiddle = new Text({
            text: 'mid<s>dle</s>',
            style: {
                fontFamily: 'Outfit',
                fontSize: FONT_SIZE,
                fill: 'black',
                textBaseline: 'middle',
                tagStyles: {
                    s: { fontSize: 14, fill: 'green' },
                },
            },
        });

        textMiddle.x = 250;
        textMiddle.y = TEXT_Y;
        scene.addChild(textMiddle);

        const graphics = new Graphics();

        graphics.setStrokeStyle({ width: 2, color: 0xfeeb77 });
        graphics.beginPath();
        graphics.lineTo(400, 0);
        graphics.closePath();
        graphics.stroke();
        graphics.x = 0;
        graphics.y = TEXT_Y + FONT_SIZE;
        scene.addChild(graphics);
    },
};
