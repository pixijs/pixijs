import { Graphics, Text, TextStyle } from '~/scene';

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
                width: 0,
            },
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 200,
            breakWords: true,
        });

        const text = new Text({
            text: 'PixiJS is very cool indeed',
            style
        });

        const whiteBox = new Graphics().rect(0, 0, 128, 128).fill(0xFFFFFF);

        scene.addChild(whiteBox);
        scene.addChild(text);

        // This SHOULD result in a totally white texture :)
    },
};
