import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break words only when necessary with breakWords:false (CSS break-word)',
    create: async (scene: Container, renderer) =>
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

        const shortWords = new HTMLText({
            text: '<yellow>Hello</yellow> <green>World</green>',
            style,
        });

        const longWord = new HTMLText({
            text: '<green>Superlongword</green>',
            style,
            position: { x: 0, y: 45 }
        });

        const hyphenated = new HTMLText({
            text: '<green>self-aware</green>',
            style,
            position: { x: 0, y: 90 }
        });

        scene.addChild(shortWords);
        scene.addChild(longWord);
        scene.addChild(hyphenated);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 350));
    },
};
