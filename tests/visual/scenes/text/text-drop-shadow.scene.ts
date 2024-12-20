import { Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with correct drop shadow',
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            align: 'center',
            dropShadow: {
                color: 0x000000,
                alpha: 0.5,
                blur: 0,
                distance: 15,
                angle: 45,
            }
        });

        const text = new Text({
            text: 'PixiJS',
            style
        });

        scene.addChild(text);

        renderer.render(scene);
        text.style.dropShadow.color = 'red';
    },
};
