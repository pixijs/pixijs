import { BitmapText, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render two text correctly with the same style and value',
    excludeRenderers: ['canvas'],
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({
            fill: '#FFC700',
            fontSize: 32,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });

        const text = new BitmapText({
            text: '1',
            style
        });

        scene.addChild(text);

        const text2 = new BitmapText({
            text: '2',
            style,
            y: 40
        });

        scene.addChild(text2);

        renderer.render(scene);
        text2.text = '1';
    },
};
