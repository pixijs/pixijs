import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text stroke with anchor and tagged text correctly',
    create: async (scene: Container, renderer) =>
    {
        const text = new HTMLText({
            text: '<thick>Pixi</thick><thin>JS</thin>',
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
                    thick: {
                        stroke: {
                            color: 0x000000,
                            width: 10,
                        },
                    },
                    thin: {
                        stroke: {
                            color: 0xFF0000,
                            width: 5,
                        },
                    },
                },
            },
            anchor: 0.5,
            x: 128 / 2,
            y: 128 / 2,
        });

        scene.addChild(text);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
