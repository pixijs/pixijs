import { Text } from '../../../../src/scene/text/Text';
import { TextStyle } from '../../../../src/scene/text/TextStyle';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render two text correctly with the same style and value',
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({
            fill: '#FFC700',
            fontSize: 32,
            fontFamily: 'Poppins, Arial',
            fontWeight: 'bold'
        });

        const text = new Text({
            text: '1',
            style
        });

        scene.addChild(text);

        const text2 = new Text({
            text: '2',
            style,
            y: 40
        });

        scene.addChild(text2);

        renderer.render(scene);
        text2.text = '1';
    },
};
