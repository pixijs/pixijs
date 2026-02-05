import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text letter spacing correctly',
    options: {
        width: 450,
        height: 50,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baseStyle = {
            fontFamily: 'Outfit',
            fontSize: 24,
            fill: 0x000000,
        };

        const spacings = [0, 5, 10, -2];
        let x = 10;

        for (const spacing of spacings)
        {
            const text = new HTMLText({
                text: `ls:${spacing}`,
                style: { ...baseStyle, letterSpacing: spacing },
            });

            text.position.set(x, 10);
            scene.addChild(text);
            x += 120;
        }

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
