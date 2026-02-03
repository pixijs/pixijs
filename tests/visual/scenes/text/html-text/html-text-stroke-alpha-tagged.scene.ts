import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text stroke and fill alpha separately with tagged text correctly',
    create: async (scene: Container, renderer) =>
    {
        const text = new HTMLText({
            text: '<red>Hi</red>\n<blue>Hi</blue>',
            style: {
                fontSize: 64,
                fill: 'rgba(255, 0, 0, 0.25)',
                stroke: {
                    width: 4,
                },
                tagStyles: {
                    red: {
                        fill: 'rgba(255, 0, 0, 0.25)',
                        stroke: {
                            width: 4,
                            color: 0x000000,
                        },
                    },
                    blue: {
                        fill: 'rgba(0, 0, 255, 0.5)',
                        stroke: {
                            width: 6,
                            color: 0xFF0000,
                            alpha: 0.5,
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
