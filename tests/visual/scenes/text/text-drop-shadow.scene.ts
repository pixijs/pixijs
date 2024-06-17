import { Text } from '../../../../src/scene/text/Text';
import { TextStyle } from '../../../../src/scene/text/TextStyle';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text with correct drop shadow',
    pixelMatch: 200,
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
