import { Assets } from '~/assets';
import { BitmapFont, BitmapText, FillGradient } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render installed bitmap text correctly with fills',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 0, y: 1 },
            colorStops: [
                { offset: 0, color: '#EE7536' },
                { offset: 0.2, color: '#EEA043' },
                { offset: 0.7, color: '#DD552A' },
                { offset: 1, color: '#EE7535' },
            ],
            textureSpace: 'local',
        });

        BitmapFont.install({
            name: 'nonTint',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: gradient,
                stroke: {
                    color: 'white',
                    width: 4,
                }
            },
        });
        BitmapFont.install({
            name: 'tint',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'white'
            },
        });

        const textBitmap = new BitmapText({
            text: 'BitText',
            style: {
                fontFamily: 'nonTint',
                fontSize: 35,
                fill: 'green', // should be ignored due to gradient fill
            },
            anchor: { x: 0.5, y: 0 },
            position: { x: 128 / 2, y: 0 }

        });

        // A bitmap that can be tinted
        const textBitmap2 = new BitmapText({
            text: 'BitText',
            style: {
                fontFamily: 'tint',
                fontSize: 35,
                fill: 'blue'
            },
            anchor: { x: 0.5, y: 0 },
            position: { x: 128 / 2, y: textBitmap.height + 10 }

        });

        scene.addChild(textBitmap, textBitmap2);
    },
};
