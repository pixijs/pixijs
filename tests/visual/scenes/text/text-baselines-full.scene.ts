import { type TextStyleTextBaseline } from '../../../../src/scene/text/TextStyle';
import { Assets } from '~/assets';
import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render all text baselines correctly',
    options: {
        width: 700,
        height: 64,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baselines: TextStyleTextBaseline[] = ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'];
        const TEXT_Y = 0;
        const FONT_SIZE = 20;

        // Draw horizontal reference line
        const line = new Graphics();

        line.setStrokeStyle({ width: 2, color: 'yellow' });
        line.moveTo(0, TEXT_Y + FONT_SIZE);
        line.lineTo(1100, TEXT_Y + FONT_SIZE);
        line.stroke();
        scene.addChild(line);

        // Create text for each baseline
        let xPos = 10;

        for (const baseline of baselines)
        {
            const text = new Text({
                text: baseline,
                style: {
                    fontFamily: 'Outfit',
                    fontSize: FONT_SIZE,
                    fill: 'white',
                    textBaseline: baseline,
                    padding: 100,
                },
            });

            text.x = xPos;
            text.y = TEXT_Y;
            scene.addChild(text);

            xPos += 125;
        }
    },
};
