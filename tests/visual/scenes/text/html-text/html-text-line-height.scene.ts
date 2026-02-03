import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text line height correctly',
    options: {
        width: 350,
        height: 100,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baseStyle = {
            fontFamily: 'Outfit',
            fontSize: 24,
            fill: 0x000000,
        };

        const lineHeights = [undefined, 20, 40];
        let x = 10;

        for (const lh of lineHeights)
        {
            const label = lh === undefined ? 'default' : `lh:${lh}`;
            const text = new HTMLText({
                text: `${label}\nLine2`,
                style: { ...baseStyle, lineHeight: lh },
            });

            text.position.set(x, 10);
            scene.addChild(text);
            x += 130;
        }

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
