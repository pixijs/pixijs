import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text font styles correctly',
    options: {
        width: 440,
        height: 200,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const baseStyle = {
            fontFamily: 'Outfit',
            fontSize: 36,
        };

        const normalStyle = new HTMLText({
            text: 'normal',
            style: { ...baseStyle, fontStyle: 'normal' as const },
            position: { x: 10, y: 10 },
        });

        const italicStyle = new HTMLText({
            text: 'italic',
            style: { ...baseStyle, fontStyle: 'italic' as const },
            position: { x: 150, y: 10 },
        });

        const obliqueStyle = new HTMLText({
            text: 'oblique',
            style: { ...baseStyle, fontStyle: 'oblique' as const },
            position: { x: 280, y: 10 },
        });

        const normalVariant = new HTMLText({
            text: 'Hello World',
            style: { ...baseStyle, fontVariant: 'normal' },
            position: { x: 10, y: 70 },
        });

        const smallCapsVariant = new HTMLText({
            text: 'Hello World',
            style: { ...baseStyle, fontVariant: 'small-caps' },
            position: { x: 230, y: 70 },
        });

        const combinedStyle = new HTMLText({
            text: 'Hello World',
            style: { ...baseStyle, fontStyle: 'italic' as const, fontVariant: 'small-caps' },
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

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
