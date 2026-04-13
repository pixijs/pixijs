import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break long words so width does not exceed wordWrapWidth',
    options: {
        width: 250,
        height: 300,
    },
    create: async (scene: Container) =>
    {
        const text = new BitmapText({
            // eslint-disable-next-line max-len
            text: 'Pixi.js - The HTML5 Creation Engine. Create beautiful digital content with the supercalifragilisticexpialidociously fastest, most flexible 2D WebGL renderer.',
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
            },
        });

        scene.addChild(text);
    },
};
