import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke with tagged text correctly',
    create: async (scene: Container) =>
    {
        const text = new Text({
            text: '<stroked>PixiJS is very cool</stroked> <plain>indeed</plain>',
            style: {
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 36,
                fill: 0xFFFFFF,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: true,
                tagStyles: {
                    stroked: {
                        stroke: {
                            color: 0x000000,
                            width: 0,
                        },
                    },
                    plain: {
                        stroke: {
                            color: 0x000000,
                            width: 4,
                        },
                    },
                },
            }
        });

        const whiteBox = new Graphics().rect(0, 0, 128, 128).fill(0xFFFFFF);

        scene.addChild(whiteBox);
        scene.addChild(text);
    },
};
