import { Assets } from '~/assets';
import { Graphics, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text alignment with tagged text correctly using split text',
    options: {
        width: 800,
    },
    create: async (scene: Container) =>
    {
        await Assets.load({ src: 'fonts/outfit.woff2', data: { weights: ['100', 'normal', 'bold'] } });

        const alignments = ['left', 'center', 'right', 'justify'] as const;
        const columnWidth = 200;
        const textWidth = 160;
        const padding = (columnWidth - textWidth) / 2;

        alignments.forEach((align, i) =>
        {
            const x = (i * columnWidth) + padding;

            const graphics = new Graphics();

            graphics.setStrokeStyle({ width: 1, color: 0xcccccc });
            graphics.moveTo(x, 0);
            graphics.lineTo(x, 200);
            graphics.moveTo(x + textWidth, 0);
            graphics.lineTo(x + textWidth, 200);
            graphics.stroke();
            scene.addChild(graphics);

            const text = new Text({
                text: '<bold>Hello</bold> <normal>world</normal> <italic>test</italic> alignment test alignment',
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 24,
                    fill: 'black',
                    align,
                    wordWrap: true,
                    wordWrapWidth: textWidth,
                    tagStyles: {
                        bold: { fontWeight: 'bold' },
                        normal: { fontWeight: 'normal' },
                        italic: { fontStyle: 'italic', fontWeight: '100' },
                    },
                },
            });

            const splitResult = SplitText.from(text);

            splitResult.x = x;
            splitResult.y = 10;
            scene.addChild(splitResult);
        });
    },
};
