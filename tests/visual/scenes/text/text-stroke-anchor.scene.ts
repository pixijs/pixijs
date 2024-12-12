import { BitmapText, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke if it has a width greater than one',
    create: async (scene: Container) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            stroke: {
                color: 0x000000,
                width: 10,
            },
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 200,
            breakWords: true,
        });

        const text = new BitmapText({
            text: 'PixiJS',
            style,
            anchor: 0.5,
            x: 128 / 2,
            y: 128 / 2,
        });

        scene.addChild(text);
    },
};
