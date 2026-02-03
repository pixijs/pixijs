import { Color } from '~/color';
import { FillGradient, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text stroke fills with tagged text correctly',
    create: async (scene: Container, renderer) =>
    {
        const gradient = new FillGradient(0, 0, 67, 0, 'global')
            .addColorStop(0, 0xff0000)
            .addColorStop(0.5, 0x00ff00)
            .addColorStop(1, 0x0000ff);

        const text = new Text({
            text: '<solid>Solid</solid>\n<colored>Colored</colored>\n<gradient>Gradient</gradient>',
            style: {
                fontSize: 24,
                fill: 0xffffff,
                tagStyles: {
                    solid: {
                        stroke: {
                            color: 0xff0000,
                            width: 5,
                        },
                        fill: 0x0000ff,
                    },
                    colored: {
                        stroke: {
                            color: new Color(0xff0000),
                            width: 5,
                        },
                        fill: {
                            color: 0x0000ff,
                            alpha: 0.5,
                        },
                    },
                    gradient: {
                        stroke: {
                            fill: gradient,
                            width: 5,
                        },
                        fill: {
                            color: 0x0000ff,
                            alpha: 1,
                        },
                    },
                },
            },
        });

        scene.addChild(text);
        renderer.render(scene);
    },
};
