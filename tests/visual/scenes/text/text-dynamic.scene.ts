import { Text } from '../../../../src/scene/text/Text';
import { TextStyle } from '../../../../src/scene/text/TextStyle';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text at new resolution',
    pixelMatch: 800,
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
