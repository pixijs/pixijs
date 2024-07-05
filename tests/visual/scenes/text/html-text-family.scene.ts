import { Assets } from '../../../../src/assets/Assets';
import { HTMLText } from '../../../../src/scene/text-html/HTMLText';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render html-text correctly with tag styles for family',
    create: async (scene: Container, renderer: Renderer) =>
    {
        await Assets.load([
            {
                alias: 'Poppins100',
                src: 'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrLPTucHtAOvWDSA.woff2',
                data: {
                    family: 'Poppins100',
                }
            },
            {
                alias: 'Poppins800',
                src: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLDD4Z1xlFd2JQEk.woff2',
                data: {
                    family: 'Poppins800',
                }
            }
        ]);

        const text = new HTMLText({
            text: '<medium>M</medium><bold>M</bold>',
            style: {
                fill: 'white',
                fontSize: 70,
                tagStyles: {
                    medium: { fill: '#6c6', fontFamily: 'Poppins100' },
                    bold: { fill: '#66c', fontFamily: 'Poppins800' }
                }
            }
        });

        scene.addChild(text);
        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 100));
    },
};
