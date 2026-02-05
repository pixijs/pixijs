import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render font styles with split text correctly',
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
        };

        const normalStyle = new Text({
            text: 'normal',
            style: { ...baseStyle, fontStyle: 'normal' },
            position: { x: 10, y: 10 },
        });

        const italicStyle = new Text({
            text: 'italic',
            style: { ...baseStyle, fontStyle: 'italic' },
            position: { x: 150, y: 10 },
        });

        const obliqueStyle = new Text({
            text: 'oblique',
            style: { ...baseStyle, fontStyle: 'oblique' },
            position: { x: 280, y: 10 },
        });

        const normalVariant = new Text({
            text: 'Hello World',
            style: { ...baseStyle, fontVariant: 'normal' },
            position: { x: 10, y: 70 },
        });

        const smallCapsVariant = new Text({
            text: 'Hello World',
            style: { ...baseStyle, fontVariant: 'small-caps' },
            position: { x: 230, y: 70 },
        });

        const combinedStyle = new Text({
            text: 'Hello World',
            style: { ...baseStyle, fontStyle: 'italic', fontVariant: 'small-caps' },
            position: { x: 10, y: 130 },
        });

        scene.addChild(
            SplitText.from(normalStyle, { x: 10, y: 10 }),
            SplitText.from(italicStyle, { x: 150, y: 10 }),
            SplitText.from(obliqueStyle, { x: 280, y: 10 }),
            SplitText.from(normalVariant, { x: 10, y: 70 }),
            SplitText.from(smallCapsVariant, { x: 230, y: 70 }),
            SplitText.from(combinedStyle, { x: 10, y: 130 }),
        );
    },
};
