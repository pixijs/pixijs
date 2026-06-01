import { Assets } from '~/assets';
import { BitmapText, Graphics, HTMLText, SplitBitmapText, SplitText, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render text beginning with whitespace across split and un-split variants',
    options: {
        width: 800,
        height: 320,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const sample = '  Hello, world!';
        const taggedSample = '  <green>Hello,</green> <red>world!</red>';
        const tagStyles = {
            green: { fill: 0x66ff66 },
            red: { fill: 0xff6666 },
        };
        const columnWidth = 800 / 4;
        const columnPad = 10;
        const labelStyle = {
            fontFamily: 'Outfit',
            fontSize: 14,
            fill: 0x000000,
        } as const;
        const textStyle = {
            fontFamily: 'Outfit',
            fontSize: 24,
            fill: 0xffffff,
        } as const;

        const variants: Array<{ label: string; split: () => Container; regular: () => Container }> = [
            {
                label: 'Canvas Text',
                split: () => new SplitText({ text: sample, style: { ...textStyle } }),
                regular: () => new Text({ text: sample, style: { ...textStyle } }),
            },
            {
                label: 'Tagged Text',
                split: () => new SplitText({
                    text: taggedSample,
                    style: { ...textStyle, tagStyles },
                }),
                regular: () => new Text({
                    text: taggedSample,
                    style: { ...textStyle, tagStyles },
                }),
            },
            {
                label: 'Bitmap Text',
                split: () => new SplitBitmapText({ text: sample, style: { ...textStyle } }),
                regular: () => new BitmapText({ text: sample, style: { ...textStyle } }),
            },
            {
                label: 'HTML Text',
                split: () => new HTMLText({ text: sample, style: { ...textStyle, whiteSpace: 'pre' } }),
                regular: () => new HTMLText({ text: sample, style: { ...textStyle, whiteSpace: 'pre' } }),
            },
        ];

        variants.forEach((variant, i) =>
        {
            const x = (i * columnWidth) + columnPad;

            const label = new Text({ text: variant.label, style: labelStyle });

            label.x = x;
            label.y = 10;
            scene.addChild(label);

            const marker = new Graphics()
                .rect(x, 40, 1, 220)
                .fill(0xff00ff);

            scene.addChild(marker);

            const splitNode = variant.split();

            splitNode.x = x;
            splitNode.y = 60;
            scene.addChild(splitNode);

            const splitTag = new Text({ text: 'split', style: { ...labelStyle, fontSize: 11 } });

            splitTag.x = x;
            splitTag.y = 100;
            scene.addChild(splitTag);

            const regularNode = variant.regular();

            regularNode.x = x;
            regularNode.y = 140;
            scene.addChild(regularNode);

            const regularTag = new Text({ text: 'regular', style: { ...labelStyle, fontSize: 11 } });

            regularTag.x = x;
            regularTag.y = 180;
            scene.addChild(regularTag);
        });

        renderer.render(scene);
    },
};
