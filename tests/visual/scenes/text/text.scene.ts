import { Text } from '../../../../src/scene/text/Text';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text correctly if style changes',
    pixelMatch: 250,
    create: async (scene: Container, renderer: Renderer) =>
    {
        const text = new Text({
            text: 'I should be red and wrap wrap wrapping',
            style: {
                fontSize: 20,
                fill: 'white',
            }
        });

        scene.addChild(text);

        renderer.render(scene);

        text.style.wordWrap = true;
        text.style.fill = 'red';
        text.style.wordWrapWidth = 100;
    },
};
