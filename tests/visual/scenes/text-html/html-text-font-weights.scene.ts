import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text font weights correctly',
    options: {
        width: 200,
        height: 256,
    },
    create: async (scene: Container, renderer) =>
    {
        const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
        const lineHeight = 28;

        weights.forEach((weight, index) =>
        {
            const text = new HTMLText({
                text: `${weight} Weight`,
                style: {
                    fontFamily: 'monospace',
                    fontWeight: weight,
                    fontSize: 28,
                    fill: 'white',
                },
            });

            text.position.set(4, index * lineHeight);
            scene.addChild(text);
        });

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
