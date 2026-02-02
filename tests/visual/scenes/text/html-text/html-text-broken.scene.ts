import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text correctly with incomplete tags',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const text = new HTMLText({
            text: 'Hello <br',
            style: {
                fill: 'white',
                fontSize: 50,
                fontWeight: 'bold'
            }
        });

        scene.addChild(text);
        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
