import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with correct drop shadow using split text',
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

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);

        renderer.render(scene);
        splitResult.style.dropShadow.color = 'red';
        splitResult.styleChanged();
    },
};
