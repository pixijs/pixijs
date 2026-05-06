import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render trailing glyph after a glyph-less word-break char (NBSP) without overlapping the leading glyph',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/msdf/Roboto-Regular.fnt');

        // Roboto-Regular.fnt has no glyph for U+00A0 NBSP. Pre-fix, the trailing
        // 'X' rendered at x=0 and overlapped the leading 'A'. See issue #12031.
        const text = new BitmapText({
            text: 'ABC X',
            style: {
                fontFamily: 'Roboto-Regular',
                fontSize: 32,
                fill: 'white',
            },
            x: 4,
            y: 40,
        });

        scene.addChild(text);
    },
};
