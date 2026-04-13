import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
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
            breakWords: false, // CSS break-word behavior
        };

        // Short words stay intact, wrap to next line
        const shortWords = new BitmapText({
            text: 'Hello World',
            style,
        });

        // Long word breaks as last resort
        const longWord = new BitmapText({
            text: 'Superlongword',
            style,
            position: { x: 0, y: 45 }
        });

        // Hyphenated word breaks after hyphen
        const hyphenated = new BitmapText({
            text: 'self-aware',
            style,
            position: { x: 0, y: 90 }
        });

        scene.addChild(shortWords);
        scene.addChild(longWord);
        scene.addChild(hyphenated);
    },
};
