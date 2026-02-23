import { Assets } from '~/assets';
import { Graphics, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with baseline and tagged text correctly using split text',
    options: {
        width: 250,
        height: 30,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const TEXT_Y = 0;
        const FONT_SIZE = 20;

        const text = new Text({
            text: '<alpha>alphabetic</alpha> <bottom>bottom</bottom> <middle>middle</middle>',
            style: {
                fontFamily: 'Outfit',
                fontSize: FONT_SIZE,
                fill: 'black',
                tagStyles: {
                    alpha: { textBaseline: 'alphabetic' },
                    bottom: { textBaseline: 'bottom' },
                    middle: { textBaseline: 'middle' },
                },
            },
        });

        const splitResult = SplitText.from(text);

        splitResult.x = 10;
        splitResult.y = TEXT_Y;
        scene.addChild(splitResult);

        const graphics = new Graphics();

        graphics.setStrokeStyle({ width: 2, color: 0xfeeb77 });
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(250, 0);
        graphics.stroke();
        graphics.x = 0;
        graphics.y = TEXT_Y + FONT_SIZE;
        scene.addChild(graphics);
    },
};
