import { Graphics, HTMLText, HTMLTextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text stroke if it has a width greater than one',
    create: async (scene: Container, renderer) =>
    {
        const style = new HTMLTextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            stroke: {
                color: 0x000000,
                width: 0,
            },
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 200,
            breakWords: true,
        });

        const text = new HTMLText({
            text: 'PixiJS is very cool indeed',
            style
        });

        const whiteBox = new Graphics().rect(0, 0, 128, 128).fill(0xFFFFFF);

        scene.addChild(whiteBox);
        scene.addChild(text);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
