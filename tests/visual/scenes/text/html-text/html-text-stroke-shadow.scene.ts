import { HTMLText, HTMLTextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text with correct drop shadow & stroke',
    create: async (scene: Container, renderer) =>
    {
        const style = new HTMLTextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 50,
            fill: 0xffffff,
            align: 'center',
            dropShadow: {
                color: 0x000000,
                alpha: 1,
                blur: 0,
                distance: 15,
                angle: 45,
            },
            stroke: {
                color: 'red',
                alpha: 1,
                width: 10,
            },
        });

        const text = new HTMLText({
            text: 'H',
            style,
        });

        scene.addChild(text);

        renderer.render(scene);

        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
