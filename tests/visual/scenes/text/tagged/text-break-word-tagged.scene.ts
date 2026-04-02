import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break words only when necessary with breakWords:false (CSS break-word)',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const style = {
            fontFamily: 'Outfit',
            fontSize: 18,
            wordWrap: true,
            wordWrapWidth: 70,
            breakWords: false,
            tagStyles: {
                green: { fill: 'green' },
                yellow: { fill: 'yellow' },
            },
        };

        const shortWords = new Text({
            text: '<yellow>Hello</yellow> <green>World</green>',
            style,
        });

        const longWord = new Text({
            text: '<green>Superlongword</green>',
            style,
            position: { x: 0, y: 45 }
        });

        const hyphenated = new Text({
            text: '<green>self-aware</green>',
            style,
            position: { x: 0, y: 90 }
        });

        scene.addChild(shortWords);
        scene.addChild(longWord);
        scene.addChild(hyphenated);
    },
};
