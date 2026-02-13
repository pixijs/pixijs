import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text correctly if text changes using split text',
    options: {
        width: 750,
        height: 40,
    },
    create: async (scene: Container, renderer: Renderer) =>
    {
        const style2 = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            trim: true,
        });

        const richText2 = new Text({
            text: 'Rich text with a lot of options and across multiple lines',
            style: style2,
        });

        const splitResult = SplitText.from(richText2);

        scene.addChild(splitResult);

        renderer.render(scene);

        splitResult.text = 'Rich text with a lot of option 22222';
    },
};
