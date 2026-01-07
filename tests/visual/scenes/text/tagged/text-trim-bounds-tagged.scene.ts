import { Assets } from '~/assets';
import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render trimmed bounds with tagged text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text = new Text({
            text: '<red>NO</red> <blue>TRIM</blue>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: 'white',
                padding: 25,
                letterSpacing: 2,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' },
                },
            },
        });

        scene.addChild(text);
        text.position.x = 10;

        const tb = text.getBounds();
        const textRect = new Graphics();

        textRect.rect(tb.x, tb.y, tb.width, tb.height);
        textRect.stroke({ width: 2, color: 0xfeeb77 });
        scene.addChild(textRect);

        const text2 = new Text({
            text: '<green>TRIM</green>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 24,
                fill: 'white',
                padding: 5,
                letterSpacing: 2,
                trim: true,
                tagStyles: {
                    green: { fill: 'green' },
                },
            },
        });

        scene.addChild(text2);
        text2.position.x = 10;
        text2.position.y = tb.height + 5;

        const tb2 = text2.getBounds();
        const textRect2 = new Graphics();

        textRect2.rect(tb2.x, tb2.y, tb2.width, tb2.height);
        textRect2.stroke({ width: 2, color: 0xfeeb77 });
        scene.addChild(textRect2);
    },
};
