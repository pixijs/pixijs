import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text font styles with tagged text correctly',
    options: {
        width: 440,
        height: 200,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const styleComparison = new HTMLText({
            text: '<normal>normal</normal> <italic>italic</italic> <oblique>oblique</oblique>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                tagStyles: {
                    normal: { fontStyle: 'normal' },
                    italic: { fontStyle: 'italic' },
                    oblique: { fontStyle: 'oblique' },
                },
            },
            position: { x: 10, y: 10 },
        });

        const variantComparison = new HTMLText({
            text: '<normal>Hello World</normal> <small>Hello World</small>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                tagStyles: {
                    normal: { fontWeight: 'normal' },
                    small: { fontVariant: 'small-caps' },
                },
            },
            position: { x: 10, y: 70 },
        });

        const combinedStyle = new HTMLText({
            text: '<small><bold>Hello</bold> <italic>World</italic></small> <both>Bold+Italic</both>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 36,
                fill: 'black',
                tagStyles: {
                    small: { fontVariant: 'small-caps' },
                    bold: { fontWeight: 'bold' },
                    italic: { fontStyle: 'italic' },
                    both: { fontWeight: 'bold', fontStyle: 'italic' },
                },
            },
            position: { x: 10, y: 130 },
        });

        scene.addChild(styleComparison, variantComparison, combinedStyle);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
