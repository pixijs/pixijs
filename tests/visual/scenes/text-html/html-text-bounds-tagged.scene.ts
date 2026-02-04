import { Assets } from '~/assets';
import { Graphics, HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text bounds with tagged text correctly',
    options: {
        width: 164,
        height: 64,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/msdf/pinyon/PinyonScript-Regular.ttf');

        const text = new HTMLText({
            text: '<red>aff</red> <blue>fi if fl</blue>',
            style: {
                fontFamily: 'Pinyonscript Regular',
                fontSize: 24,
                fill: 'red',
                padding: 25,
                letterSpacing: 2,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' },
                },
            },
            anchor: { x: 0.5, y: 0.5 },
        });

        scene.addChild(text);
        text.position.x = 10 + (text.width / 2);
        text.position.y = (text.height / 2);

        const tb = text.getBounds();
        const textRect = new Graphics();

        textRect.rect(tb.x, tb.y, tb.width, tb.height);
        textRect.stroke({ width: 2, color: 0xfeeb77 });
        scene.addChild(textRect);

        const text2 = new HTMLText({
            text: '<green>aff</green> <yellow>fi if fl</yellow>',
            style: {
                fontSize: 24,
                fill: 'red',
                fontStyle: 'italic',
                tagStyles: {
                    green: { fill: 'green' },
                    yellow: { fill: 'yellow' },
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

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
