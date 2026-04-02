import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render dynamic trim with tagged text correctly using split text',
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
            tagStyles: {
                red: { fill: 'red' },
                blue: { fill: 'blue' },
            },
        });

        const richText2 = new Text({
            text: '<red>Rich text</red> with a <blue>lot of options</blue> and across multiple lines',
            style: style2,
        });

        const splitResult = SplitText.from(richText2);

        scene.addChild(splitResult);

        renderer.render(scene);

        splitResult.text = '<red>Rich text</red> with a <blue>lot of option 22222</blue>';
    },
};
