import { HTMLText, HTMLTextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render two html-text correctly with the same style and value',
    create: async (scene: Container, renderer) =>
    {
        const style = new HTMLTextStyle({
            fill: '#FFC700',
            fontSize: 32,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });

        const text = new HTMLText({
            text: '1',
            style
        });

        scene.addChild(text);

        const text2 = new HTMLText({
            text: '2',
            style,
            y: 40
        });

        scene.addChild(text2);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
        text2.text = '1';

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
