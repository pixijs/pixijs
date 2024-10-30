import { Text } from '../../../../src/scene/text/Text';
import { TextStyle } from '../../../../src/scene/text/TextStyle';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text correctly if style changes',
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

        scene.addChild(richText2);

        renderer.render(scene);

        richText2.text = 'Rich text with a lot of option 22222';
    },
};
