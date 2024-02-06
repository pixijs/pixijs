import { Assets } from '../../../../src/assets/Assets';
import { AlphaFilter } from '../../../../src/filters/defaults/alpha/AlphaFilter';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render both canvas and bitmap text of the same style',
    pixelMatch: 250,
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');
        const textCanvas = new Text({
            text: 'Im canvas 🔥',
            style: {
                fontFamily: 'Outfit',
                fontSize: 12,
                fill: 'white',
                letterSpacing: 5,
                lineHeight: 20,
            }
        });

        const textBitmap = new BitmapText({
            text: 'Im dynamic \nbitmap 🔥',
            style: {
                fontFamily: 'Outfit',
                fontSize: 16,
                letterSpacing: 5,
                // lineHeight: 20, // todo: https://github.com/orgs/pixijs/projects/2/views/4?pane=issue&itemId=46297431
            },
            y: 30,
        });

        textBitmap.tint = 0xff0000;
        textBitmap.filters = [new AlphaFilter({ alpha: 0.5 })];

        scene.addChild(textCanvas);
        scene.addChild(textBitmap);
    },
};
