import { Assets } from '~/assets';
import { BitmapText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render font styles correctly',
    excludeRenderers: ['canvas'],
    options: {
        width: 440,
        height: 200,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baseStyle = {
            fontFamily: 'Outfit',
            fontSize: 36,
            fill: 0x000000,
        };

        const normalStyle = new BitmapText({
            text: 'normal',
            style: { ...baseStyle, fontStyle: 'normal' },
            position: { x: 10, y: 10 },
        });

        const italicStyle = new BitmapText({
            text: 'italic',
            style: { ...baseStyle, fontStyle: 'italic' },
            position: { x: 150, y: 10 },
        });

        const obliqueStyle = new BitmapText({
            text: 'oblique',
            style: { ...baseStyle, fontStyle: 'oblique' },
            position: { x: 280, y: 10 },
        });

        const normalVariant = new BitmapText({
            text: 'Hello World',
            style: { ...baseStyle, fontVariant: 'normal' },
            position: { x: 10, y: 70 },
        });

        const smallCapsVariant = new BitmapText({
            text: 'Hello World',
            style: { ...baseStyle, fontVariant: 'small-caps' },
            position: { x: 230, y: 70 },
        });

        const combinedStyle = new BitmapText({
            text: 'Hello World',
            style: { ...baseStyle, fontStyle: 'italic', fontVariant: 'small-caps' },
            position: { x: 10, y: 130 },
        });

        scene.addChild(
            normalStyle,
            italicStyle,
            obliqueStyle,
            normalVariant,
            smallCapsVariant,
            combinedStyle,
        );
    },
};
