import { HTMLText, HTMLTextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text stroke and fill alpha separately',
    create: async (scene: Container, renderer) =>
    {
        const style = new HTMLTextStyle({
            fill: 'rgba(255, 0, 0, 0.25)',
            fontSize: 64,
            stroke: {
                width: 4,
            }
        });

        const text1 = new HTMLText({ text: 'Hi', style });

        scene.addChild(text1);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
