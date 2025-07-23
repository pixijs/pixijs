import { Assets, Cache } from '~/assets';
import { BitmapFont, BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should orient the rotated BitmapFont texture from a spritesheet',
    create: async (scene: Container) =>
    {
        const spritesheet = await Assets.load('fonts/font-spritesheet.json');
        const font = new BitmapFont({
            textures: [spritesheet.textures['fontsdf-copy.png']],
            data: {
                pages: [{ id: 0, file: '' }],
                chars: {
                    A: {
                        id: 65,
                        page: 0,
                        x: 248,
                        y: 74,
                        width: 29,
                        height: 35,
                        xOffset: 1,
                        yOffset: 6,
                        xAdvance: 31,
                        letter: 'A',
                        kerning: {},
                    }
                },
                fontSize: 42,
                lineHeight: 45,
                baseLineOffset: 6,
                fontFamily: 'MyCustomFont',
                distanceField: {
                    type: 'sdf',
                    range: 4
                }
            },
        });

        Cache.set('MyCustomFont', font);

        const bitmapText = new BitmapText({
            text: 'A',
            style: {
                fill: 0xffffff,
                fontFamily: font.fontFamily,
                fontSize: 42,
            },
        });

        scene.addChild(bitmapText);
    },
};
