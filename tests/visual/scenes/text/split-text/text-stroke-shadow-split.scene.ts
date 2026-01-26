import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with correct drop shadow & stroke using split text',
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({
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

        const text = new Text({
            text: 'H',
            style,
        });

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);

        renderer.render(scene);
    },
};
