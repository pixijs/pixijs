import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text with drop shadow and stroke with tagged text correctly',
    create: async (scene: Container, renderer) =>
    {
        const text = new HTMLText({
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

        scene.addChild(text);
        renderer.render(scene);

        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
