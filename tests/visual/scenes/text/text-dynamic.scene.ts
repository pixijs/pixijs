import { Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text at new resolution',
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            align: 'center',
        });

        const text = new Text({
            text: 'PixiJS',
            style
        });

        scene.addChild(text);

        renderer.render(scene);
        text.resolution = 0.5;
    },
};
