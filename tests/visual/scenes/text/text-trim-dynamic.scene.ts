import { Text } from '@/scene/text/Text';
import { TextStyle } from '@/scene/text/TextStyle';

import type { TestScene } from '../../types';
import type { Renderer } from '@/rendering/renderers/types';
import type { Container } from '@/scene/container/Container';

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
