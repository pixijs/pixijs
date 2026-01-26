import { Assets } from '~/assets';
import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text alignment correctly',
    options: {
        width: 800,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const alignments = ['left', 'center', 'right', 'justify'] as const;
        const columnWidth = 200;
        const textWidth = 160;
        const padding = (columnWidth - textWidth) / 2;

        alignments.forEach((align, i) =>
        {
            const x = (i * columnWidth) + padding;

            // Draw vertical guide lines
            const graphics = new Graphics();

            graphics.setStrokeStyle({ width: 1, color: 0xcccccc });
            graphics.moveTo(x, 0);
            graphics.lineTo(x, 200);
            graphics.moveTo(x + textWidth, 0);
            graphics.lineTo(x + textWidth, 200);
            graphics.stroke();
            scene.addChild(graphics);

            // Create text with alignment
            const text = new Text({
                text: 'Hello world test alignment',
                style: {
                    fontFamily: 'Outfit',
                    fontSize: 24,
                    fill: 'black',
                    align,
                    wordWrap: true,
                    wordWrapWidth: textWidth,
                },
            });

            text.x = x;
            text.y = 10;
            scene.addChild(text);
        });
    },
};
