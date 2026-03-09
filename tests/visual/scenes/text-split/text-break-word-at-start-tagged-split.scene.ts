import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break long words so width does not exceed wordWrapWidth using tagged split text',
    options: {
        width: 250,
        height: 300,
    },
    create: async (scene: Container) =>
    {
        const text = SplitText.from(new Text({
            // eslint-disable-next-line max-len
            text: '<red>Pixi.js</red> - The HTML5 Creation Engine. <blue>Create beautiful digital content with the supercalifragilisticexpialidociously fastest, most flexible 2D WebGL renderer.</blue>',
            style: {
                fontFamily: 'Arial',
                fontSize: 20,
                fontStyle: 'italic',
                fontVariant: 'normal',
                fontWeight: '900',
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: true,
                letterSpacing: 4,
                tagStyles: {
                    red: { fill: 'red' },
                    blue: { fill: 'blue' },
                },
            },
        }));

        scene.addChild(text);
    },
};
