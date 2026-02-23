import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text with drop shadow and stroke with tagged text correctly using split text',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const text = new Text({
            text: '<red>H</red><blue>i</blue>',
            style: {
                fontFamily: 'Arial',
                fontWeight: 'bold',
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
                tagStyles: {
                    red: {
                        stroke: {
                            color: 'red',
                            alpha: 1,
                            width: 10,
                        },
                    },
                    blue: {
                        stroke: {
                            color: 'blue',
                            alpha: 1,
                            width: 8,
                        },
                    },
                },
            },
        });

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);
        renderer.render(scene);
    },
};
