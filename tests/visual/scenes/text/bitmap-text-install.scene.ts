import { Assets } from '../../../../src/assets/Assets';
import { TextStyle } from '../../../../src/scene/text/TextStyle';
import { BitmapFont } from '../../../../src/scene/text-bitmap/BitmapFont';
import { BitmapFontManager } from '../../../../src/scene/text-bitmap/BitmapFontManager';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render an installed font correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const style = new TextStyle({
            fontSize: 200,
            stroke: {
                width: 18,
                join: 'round',
            }
        });

        BitmapFont.install({
            name: 'big-outfit',
            style,
            chars: BitmapFontManager.NUMERIC,
        });

        const textBitmap = new BitmapText({ text: 1234, style: { fontFamily: 'big-outfit', fontSize: 50 } });

        textBitmap.anchor = 0.5;
        textBitmap.position.set(128 / 2);
        scene.addChild(textBitmap);
    },
};
