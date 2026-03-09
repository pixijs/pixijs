import { Assets } from '~/assets';
import { Graphics, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render all text baselines with tagged text correctly using split text',
    options: {
        width: 500,
        height: 64,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const TEXT_Y = 0;
        const FONT_SIZE = 20;

        const line = new Graphics();

        line.setStrokeStyle({ width: 2, color: 'yellow' });
        line.moveTo(0, TEXT_Y + FONT_SIZE);
        line.lineTo(1100, TEXT_Y + FONT_SIZE);
        line.stroke();
        scene.addChild(line);

        const text = new Text({
            // eslint-disable-next-line max-len
            text: '<top>top</top> <hang>hanging</hang> <mid>middle</mid> <alpha>alphabetic</alpha> <ideo>ideographic</ideo> <bot>bottom</bot>',
            style: {
                fontFamily: 'Outfit',
                fontSize: FONT_SIZE,
                fill: 'white',
                padding: 100,
                tagStyles: {
                    top: { textBaseline: 'top' },
                    hang: { textBaseline: 'hanging' },
                    mid: { textBaseline: 'middle' },
                    alpha: { textBaseline: 'alphabetic' },
                    ideo: { textBaseline: 'ideographic' },
                    bot: { textBaseline: 'bottom' },
                },
            },
        });

        const splitResult = SplitText.from(text);

        splitResult.x = 10;
        splitResult.y = TEXT_Y;
        scene.addChild(splitResult);
    },
};
