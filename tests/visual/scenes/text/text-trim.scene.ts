import { Text } from '~/scene/text/Text';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering/renderers/types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render text correctly if style changes',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const text = new Text({
            text: '    text     ',
            style: {
                fontSize: 20,
                fill: 'white',
                trim: true,
            },
        });
        const text2 = new Text({
            text: '    text     ',
            style: {
                fontSize: 20,
                fill: 'white',
                trim: false,
            }
        });

        text2.y = 30;

        scene.addChild(text, text2);

        renderer.render(scene);
    },
};
