import { Assets } from '~/assets';
import { Graphics, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with different baselines correctly using split text',
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

        const s1 = SplitText.from(textAlphabetic);

        s1.x = 10;
        s1.y = TEXT_Y;
        scene.addChild(s1);

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

        const s2 = SplitText.from(textBottom);

        s2.x = 140;
        s2.y = TEXT_Y;
        scene.addChild(s2);

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

        const s3 = SplitText.from(textMiddle);

        s3.x = 250;
        s3.y = TEXT_Y;
        scene.addChild(s3);

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
