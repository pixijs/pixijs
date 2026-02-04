import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text correctly with texture style',
    create: async (scene: Container, renderer) =>
    {
        const text = new HTMLText({
            text: 'X',
            style: {
                fontSize: 18,
                fill: 'white',
                lineHeight: 15,
                letterSpacing: 6,
                align: 'center',
            },
            textureStyle: {
                scaleMode: 'nearest',
            },
        });

        scene.addChild(text);

        text.scale = 10;

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
