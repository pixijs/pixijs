import { Graphics, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with the correct trimmed bounds using split text',
    pixelMatch: 258,
    create: async (scene: Container) =>
    {
        const text = new Text({
            text: 'NO TRIM',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 'red',
                padding: 25,
                letterSpacing: 2,
            },
        });

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);
        splitResult.position.x = 10;

        const tb = splitResult.getBounds();
        const textRect = new Graphics();

        textRect.rect(tb.x, tb.y, tb.width, tb.height);
        textRect.stroke({ width: 2, color: 0xfeeb77 });
        scene.addChild(textRect);

        const text2 = new Text({
            text: 'TRIM',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 'red',
                padding: 5,
                letterSpacing: 2,
                trim: true,
            },
        });

        const splitResult2 = SplitText.from(text2);

        scene.addChild(splitResult2);
        splitResult2.position.x = 10;
        splitResult2.position.y = tb.height + 5;

        const tb2 = splitResult2.getBounds();
        const textRect2 = new Graphics();

        textRect2.rect(tb2.x, tb2.y, tb2.width, tb2.height);
        textRect2.stroke({ width: 2, color: 0xfeeb77 });
        scene.addChild(textRect2);
    },
};
